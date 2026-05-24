import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'
import { sendVouchVerificationEmail } from '@/lib/email'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  const { data: vouch } = await db
    .from('vouches')
    .select('id, giver_name, giver_email, verified, profile_id, profiles(name, user_id)')
    .eq('id', id)
    .single()

  if (!vouch) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const profile = Array.isArray(vouch.profiles) ? vouch.profiles[0] : vouch.profiles
  if (!profile || (profile as { user_id: string }).user_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (vouch.verified) {
    return NextResponse.json({ error: 'Already verified' }, { status: 400 })
  }

  // Generate a fresh token and update the vouch
  const new_token = nanoid(32)
  const { error: updateError } = await db
    .from('vouches')
    .update({ verification_token: new_token })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  await sendVouchVerificationEmail({
    to: vouch.giver_email,
    giverName: vouch.giver_name,
    candidateName: (profile as { name: string }).name,
    token: new_token,
  })

  return NextResponse.json({ success: true })
}
