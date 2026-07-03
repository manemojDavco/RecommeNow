// Returns the signed-in user's own profile.
// Called by the mobile app — authenticated via Clerk Bearer token.
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'
import { freeReceivedCap, publicVouchCap, planCanPrint, planCanQR, planHasDirectory, LEGACY_FREE_RECEIVED_CAP } from '@/lib/plans'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  console.log('[/api/profile/me] userId from Bearer token:', userId)

  const db = createServiceClient()
  // Select only the base-schema columns that are guaranteed to exist.
  // Columns added by later migrations (plan, photo_url, linkedin_url,
  // recruiter_active) are fetched separately so a missing migration doesn't
  // break everything. Run all migrations in /supabase/migration-*.sql to get
  // full data.
  const { data: base, error } = await db
    .from('profiles')
    .select('id, slug, name, title, location, bio, industries')
    .eq('user_id', userId)
    .single()

  console.log('[/api/profile/me] query result:', { profile: base?.id ?? null, error: error?.message ?? null })

  if (!base) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Try to fetch the optional columns added by later migrations.
  // If any column doesn't exist yet, the whole select fails — we catch that
  // and fall back to safe defaults.
  let extras: {
    plan?: string; photo_url?: string | null; linkedin_url?: string | null; recruiter_active?: boolean;
    phone?: string | null; contact_email?: string | null; remote_preference?: string | null; availability?: string | null;
    show_phone?: boolean; show_linkedin?: boolean; show_contact_email?: boolean; show_working_pref?: boolean; show_availability?: boolean;
    free_legacy?: boolean | null; free_expires_at?: string | null; account_closed_at?: string | null;
  } = {
    plan: 'free', photo_url: null, linkedin_url: null, recruiter_active: false,
    phone: null, contact_email: null, remote_preference: null, availability: null,
    show_phone: true, show_linkedin: true, show_contact_email: true, show_working_pref: true, show_availability: true,
    free_legacy: false, free_expires_at: null, account_closed_at: null,
  }
  const { data: extData } = await db
    .from('profiles')
    .select('plan, photo_url, linkedin_url, recruiter_active, phone, contact_email, remote_preference, availability, show_phone, show_linkedin, show_contact_email, show_working_pref, show_availability, free_legacy, free_expires_at, account_closed_at')
    .eq('id', base.id)
    .single()
  if (extData) extras = extData

  const plan = extras.plan ?? 'free'

  // Received-vouch count (all statuses) + whether the FREE received cap is
  // reached (grandfathered users keep their legacy allowance). Paid plans are
  // never received-limited. Also expose the plan's public-publish cap and the
  // FREE lifecycle fields so the apps can drive gating and expiry banners.
  const { count: receivedCount } = await db
    .from('vouches')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', base.id)

  const received_vouch_count = receivedCount ?? 0
  const cap = freeReceivedCap({ free_legacy: extras.free_legacy })
  const vouch_limit_reached = plan === 'free' && received_vouch_count >= cap
  const public_vouch_cap = (plan === 'free' && extras.free_legacy)
    ? LEGACY_FREE_RECEIVED_CAP
    : publicVouchCap(plan)

  return NextResponse.json({
    profile: {
      ...base, ...extras,
      received_vouch_count, vouch_limit_reached, public_vouch_cap,
      can_print: planCanPrint(plan), can_qr: planCanQR(plan),
      has_directory: planHasDirectory(plan) || !!extras.recruiter_active,
    },
  })
}
