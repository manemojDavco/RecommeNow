import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { publicVouchCap, LEGACY_FREE_RECEIVED_CAP } from '@/lib/plans'

// Public profile columns safe to expose. NEVER include user_id (Clerk ID),
// stripe_customer_id, stripe_subscription_id, iap_transaction_id,
// iap_product_id, push_token, or pro_trial_until — those are private.
const PROFILE_COLUMNS = [
  'id', 'slug', 'name', 'title', 'years_experience', 'location',
  'remote_preference', 'bio', 'industries', 'stages', 'photo_url',
  'linkedin_url', 'contact_email', 'phone', 'availability',
  'show_phone', 'show_linkedin', 'show_contact_email',
  'show_working_pref', 'show_availability', 'created_at',
  'plan', 'recruiter_active',
].join(', ')

// Public vouch columns. Excludes giver_email and verification_token
// (verification_token would let anyone mark a vouch verified).
const VOUCH_COLUMNS = [
  'id', 'profile_id', 'giver_name', 'giver_title', 'giver_company',
  'giver_relationship', 'traits', 'quote', 'star_rating', 'verified',
  'status', 'flag_count', 'display_order', 'created_at',
].join(', ')

// Null out contact fields the owner chose to keep private, so the raw
// JSON never carries data the UI is supposed to hide.
function applyVisibility(profile: Record<string, any>) {
  if (profile.show_phone === false)         profile.phone = null
  if (profile.show_contact_email === false) profile.contact_email = null
  if (profile.show_linkedin === false)      profile.linkedin_url = null
  return profile
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = createServiceClient()

  // Try exact match first
  let { data: profile } = await db
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('slug', slug)
    .single()

  // Fallback: prefix match (handles slugs with random suffixes, e.g. "nick-davchevski" → "nick-davchevski-a3bx")
  if (!profile) {
    const { data: rows } = await db
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .ilike('slug', `${slug}-%`)
      .limit(1)
    profile = rows?.[0] ?? null
  }

  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const prof = profile as Record<string, any>

  // Internal-only fields (not exposed): whether the account is closed (a lapsed
  // FREE account) and whether it's a grandfathered FREE user.
  const { data: internal } = await db
    .from('profiles')
    .select('account_closed_at, free_legacy')
    .eq('id', prof.id)
    .single()

  // A closed FREE account is taken offline — its public profile 404s until the
  // user subscribes again.
  if (internal?.account_closed_at) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  applyVisibility(prof)

  // Publish at most the number of vouches the plan allows. Grandfathered FREE
  // users keep their legacy allowance.
  const cap = (prof.plan === 'free' && internal?.free_legacy)
    ? LEGACY_FREE_RECEIVED_CAP
    : publicVouchCap(prof.plan)

  const { data: vouches } = await db
    .from('vouches')
    .select(VOUCH_COLUMNS)
    .eq('profile_id', prof.id)
    .eq('status', 'approved')
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(cap)

  const approved = (vouches ?? []) as Array<Record<string, any>>
  const verificationRate =
    approved.length > 0
      ? Math.round((approved.filter((v) => v.verified).length / approved.length) * 100)
      : 0

  return NextResponse.json({ profile, vouches: approved, verificationRate })
}
