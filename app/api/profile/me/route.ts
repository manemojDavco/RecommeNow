// Returns the signed-in user's own profile.
// Called by the mobile app — authenticated via Clerk Bearer token.
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

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
  } = {
    plan: 'free', photo_url: null, linkedin_url: null, recruiter_active: false,
    phone: null, contact_email: null, remote_preference: null, availability: null,
    show_phone: true, show_linkedin: true, show_contact_email: true, show_working_pref: true, show_availability: true,
  }
  const { data: extData } = await db
    .from('profiles')
    .select('plan, photo_url, linkedin_url, recruiter_active, phone, contact_email, remote_preference, availability, show_phone, show_linkedin, show_contact_email, show_working_pref, show_availability')
    .eq('id', base.id)
    .single()
  if (extData) extras = extData

  return NextResponse.json({ profile: { ...base, ...extras } })
}
