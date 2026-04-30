import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { sendFlagReviewEmail } from '@/lib/email'

const FLAG_THRESHOLD = 3

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { vouch_id, reason, reporter_email } = body

  if (!vouch_id || !reason?.trim()) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const db = createServiceClient()

  // Insert flag
  const { error: flagError } = await db.from('flags').insert({
    vouch_id,
    reason: reason.trim(),
    reporter_email: reporter_email?.trim() || null,
  })

  if (flagError) return NextResponse.json({ error: 'Failed to save flag.' }, { status: 500 })

  // Increment flag count and check threshold
  const { data: vouch } = await db
    .from('vouches')
    .select('id, flag_count, giver_name, giver_email, profiles(name)')
    .eq('id', vouch_id)
    .single()

  if (!vouch) return NextResponse.json({ error: 'Vouch not found.' }, { status: 404 })

  const newCount = (vouch.flag_count ?? 0) + 1
  const shouldFlag = newCount >= FLAG_THRESHOLD

  await db
    .from('vouches')
    .update({
      flag_count: newCount,
      ...(shouldFlag ? { status: 'flagged' } : {}),
    })
    .eq('id', vouch_id)

  // If newly flagged, email the giver
  if (shouldFlag && newCount === FLAG_THRESHOLD) {
    const profile = Array.isArray(vouch.profiles) ? vouch.profiles[0] : vouch.profiles
    await sendFlagReviewEmail({
      to: vouch.giver_email,
      giverName: vouch.giver_name,
      candidateName: (profile as { name: string })?.name ?? 'the candidate',
    }).catch(console.error)
  }

  return NextResponse.json({ success: true })
}
