import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'
import { generateSlug } from '@/lib/slug'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  // Check if profile already exists
  const { data: existing } = await db
    .from('profiles')
    .select('id, slug')
    .eq('user_id', userId)
    .single()

  if (existing) {
    return NextResponse.json({ profile: existing })
  }

  const body = await req.json()
  const { name, title, years_experience, location, remote_preference, availability, bio, industries, stages, referral_code: refCode } = body

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

  // Resolve referrer if a referral code was provided
  let referredBy: string | null = null
  if (refCode) {
    const { data: referrer } = await db
      .from('profiles')
      .select('user_id')
      .eq('referral_code', refCode)
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
