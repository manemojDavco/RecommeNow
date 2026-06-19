// Report (flag) an objectionable PROFILE — bio, photo, name, etc.
// Public (no auth): anyone viewing a public profile can report it. This is the
// profile-level complement to /api/vouches/flag and is part of the Guideline
// 1.2 (User-Generated Content) requirement to let users report offensive
// content. Reports land in the profile_reports table for the team to review.
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { enforceRateLimit, getFlagRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, getFlagRateLimit(),
    'Too many reports. Please try again in an hour.')
  if (limited) return limited

  let body: { profile_id?: string; slug?: string; reason?: string; reporter_email?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { profile_id, slug, reason, reporter_email } = body
  if ((!profile_id && !slug) || !reason?.trim()) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const db = createServiceClient()

  // Resolve the profile by id or slug.
  const query = db.from('profiles').select('id').limit(1)
  const { data: profile } = profile_id
    ? await query.eq('id', profile_id).single()
    : await query.eq('slug', slug).single()

  if (!profile) return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })

  const { error } = await db.from('profile_reports').insert({
    profile_id: profile.id,
    reason: reason.trim().slice(0, 1000),
    reporter_email: reporter_email?.trim()?.slice(0, 320) || null,
  })

  if (error) {
    console.error('[profiles/flag] insert error:', error.message)
    return NextResponse.json({ error: 'Failed to save report.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
