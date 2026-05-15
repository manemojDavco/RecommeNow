import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { getVouchRateLimit } from '@/lib/rate-limit'
import { sendVouchVerificationEmail, sendNewVouchNotification } from '@/lib/email'
import { sendNewVouchNotification as sendPushNewVouch } from '@/lib/push'
import { nanoid } from 'nanoid'
import { calculateVouchScore } from '@/lib/vouch-score'

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  const { success } = await getVouchRateLimit().limit(ip)
  if (!success) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again in a few hours.' },
      { status: 429 }
    )
  }

  const body = await req.json()
  const {
    profile_id,
    giver_name,
    giver_title,
    giver_company,
    giver_email,
    giver_relationship,
    traits,
    quote,
  } = body

  // Basic validation
  if (!profile_id || !giver_name || !giver_email || !quote) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }
  if (quote.trim().length < 30) {
    return NextResponse.json({ error: 'Quote must be at least 30 characters.' }, { status: 400 })
  }

  // Calculate credibility score from objective factors (voucher cannot set this)
  const { score: star_rating } = calculateVouchScore({
    relationship: giver_relationship ?? null,
    quoteLength: quote.trim().length,
    traitCount: (traits ?? []).length,
    email: giver_email.trim().toLowerCase(),
    verified: false,
  })

  const db = createServiceClient()

  // Verify profile exists
  const { data: profile } = await db
    .from('profiles')
    .select('id, name, slug, user_id, plan, push_token')
    .eq('id', profile_id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
  }

  // Enforce free plan vouch limit
  if (profile.plan === 'free') {
    const { count } = await db
      .from('vouches')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profile_id)
      .eq('status', 'approved')

    if ((count ?? 0) >= 10) {
      return NextResponse.json(
        { error: 'This profile has reached its vouch limit. Ask them to upgrade to Pro for unlimited vouches.' },
        { status: 403 }
      )
    }
  }

  const verification_token = nanoid(32)

  const { data: vouch, error } = await db
    .from('vouches')
    .insert({
      profile_id,
      giver_name: giver_name.trim(),
      giver_title: giver_title?.trim() || null,
      giver_company: giver_company?.trim() || null,
      giver_email: giver_email.trim().toLowerCase(),
      giver_relationship: giver_relationship || null,
      traits: traits ?? [],
      quote: quote.trim(),
      star_rating,
      verified: false,
      verification_token,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Vouch insert error:', error)
    return NextResponse.json({ error: 'Failed to save vouch.' }, { status: 500 })
  }

  // Send verification email to giver
  await sendVouchVerificationEmail({
    to: giver_email.trim().toLowerCase(),
    giverName: giver_name.trim(),
    candidateName: profile.name,
    token: verification_token,
  }).catch(console.error)

  // Get candidate email from Clerk and send notification
  // We look up the candidate via the user_id stored on the profile
  // For simplicity, store the email on the profile or look it up in Clerk
  // Using service client to get the profile owner's email is deferred to Clerk webhook setup
  // For now we fire a notification if CLERK_SECRET_KEY is configured
  try {
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${profile.user_id}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    })
    if (clerkRes.ok) {
      const clerkUser = await clerkRes.json()
      const candidateEmail =
        clerkUser.email_addresses?.find((e: { id: string }) => e.id === clerkUser.primary_email_address_id)?.email_address
      if (candidateEmail) {
        await sendNewVouchNotification({
          to: candidateEmail,
          candidateName: profile.name,
          giverName: giver_name.trim(),
          giverTitle: giver_title?.trim() || null,
          giverCompany: giver_company?.trim() || null,
          profileSlug: profile.slug,
        }).catch(console.error)
      }
    }
  } catch {
    // Non-fatal — vouch was already saved
  }

  // Send mobile push notification if the profile owner has the app installed
  if ((profile as any).push_token) {
    await sendPushNewVouch((profile as any).push_token, giver_name.trim()).catch(console.error)
  }

  return NextResponse.json({ success: true, vouch_id: vouch.id })
}
