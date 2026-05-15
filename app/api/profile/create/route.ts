import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'
import { generateSlug } from '@/lib/slug'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  console.log('[/api/profile/create] userId from Bearer token:', userId)

  const db = createServiceClient()

  // Check if profile already exists.
  // We select only base-schema columns here to work even if optional-column
  // migrations (phase2, linkedin, availability-photo) haven't been applied yet.
  const { data: existing, error: existingErr } = await db
    .from('profiles')
    .select('id, slug, name, title, location, bio, industries')
    .eq('user_id', userId)
    .single()

  if (existing) {
    console.log('[/api/profile/create] existing profile found:', existing.id)
    return NextResponse.json({ profile: existing })
  }
  if (existingErr && existingErr.code !== 'PGRST116') {
    // PGRST116 = "no rows found" — anything else is a real DB error
    console.error('[/api/profile/create] DB error:', existingErr.code, existingErr.message)
    return NextResponse.json({ error: `DB error: ${existingErr.message}` }, { status: 500 })
  }

  const body = await req.json()
  const { name, title, years_experience, location, remote_preference, availability, bio, industries, stages, referred_by_slug: refSlug } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }

  // Generate a unique slug
  let slug = generateSlug(name.trim())
  let attempts = 0
  while (attempts < 5) {
    const { data: taken } = await db.from('profiles').select('id').eq('slug', slug).single()
    if (!taken) break
    slug = generateSlug(name.trim())
    attempts++
  }

  // Resolve referrer by slug
  let referredBy: string | null = null
  if (refSlug) {
    const { data: referrer } = await db
      .from('profiles')
      .select('user_id')
      .eq('slug', refSlug)
      .single()
    if (referrer) referredBy = referrer.user_id
  }

  const { data: profile, error } = await db
    .from('profiles')
    .insert({
      user_id: userId,
      name: name.trim(),
      slug,
      title: title?.trim() || null,
      years_experience: years_experience?.trim() || null,
      location: location?.trim() || null,
      remote_preference: remote_preference || null,
      availability: availability || null,
      bio: bio?.trim() || null,
      industries: industries ?? [],
      stages: stages ?? [],
      referral_code: nanoid(8),
      referred_by: referredBy,
    })
    .select()
    .single()

  // Increment referrer's referral_count
  if (!error && referredBy) {
    try {
      await db.rpc('increment_referral_count', { referrer_user_id: referredBy })
    } catch { /* non-fatal */ }
  }

  if (error) {
    console.error('Profile create error:', error)
    return NextResponse.json({ error: 'Failed to create profile.' }, { status: 500 })
  }

  // ── First-100 PRO trial ───────────────────────────────────────────────────
  // If the new user's email was among the first 100 on the waitlist, grant 1
  // month of PRO automatically. We fetch their Clerk email, look it up in the
  // waitlist table, and call grant_pro_trial() when position ≤ 100.
  try {
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    })
    if (clerkRes.ok) {
      const clerkUser = await clerkRes.json()
      const email: string | undefined = clerkUser.email_addresses?.find(
        (e: { id: string }) => e.id === clerkUser.primary_email_address_id
      )?.email_address

      if (email) {
        const { data: waitlistEntry } = await db
          .from('waitlist')
          .select('position')
          .eq('email', email.toLowerCase())
          .single()

        if (waitlistEntry?.position && waitlistEntry.position <= 100) {
          await db.rpc('grant_pro_trial', {
            p_profile_id: profile!.id,
            p_days: 30,
          })
          // Return the updated profile so dashboard immediately shows PRO
          const { data: updatedProfile } = await db
            .from('profiles')
            .select()
            .eq('id', profile!.id)
            .single()
          if (updatedProfile) {
            return NextResponse.json({ profile: updatedProfile, proTrialGranted: true })
          }
        }
      }
    }
  } catch { /* non-fatal — profile is still created */ }

  return NextResponse.json({ profile })
}
