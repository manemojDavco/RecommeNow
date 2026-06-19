// Block an abusive contributor (Guideline 1.2 "ability to block abusive users").
// The profile owner deletes the offending vouch AND adds the sender's email to
// the profile's blocked list, so that contributor can no longer submit vouches
// to this profile. Only the profile owner may do this.
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  const { data: vouch } = await db
    .from('vouches')
    .select('id, profile_id, giver_email, profiles(user_id, blocked_giver_emails)')
    .eq('id', id)
    .single()

  if (!vouch) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const profile = Array.isArray(vouch.profiles) ? vouch.profiles[0] : vouch.profiles
  if (!profile || (profile as { user_id: string }).user_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Add the giver's email to the profile's blocked list (deduped).
  const email = (vouch.giver_email ?? '').trim().toLowerCase()
  if (email) {
    const existing: string[] = (profile as { blocked_giver_emails?: string[] }).blocked_giver_emails ?? []
    if (!existing.includes(email)) {
      await db
        .from('profiles')
        .update({ blocked_giver_emails: [...existing, email] })
        .eq('id', vouch.profile_id)
    }
  }

  // Remove the offending vouch.
  const { error } = await db.from('vouches').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Block failed' }, { status: 500 })

  return NextResponse.json({ success: true, blocked: email || null })
}
