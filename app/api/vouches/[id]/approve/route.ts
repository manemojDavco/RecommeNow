import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'
import { sendVouchApprovedEmail } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  // Verify the vouch belongs to the authenticated user's profile
  const { data: vouch } = await db
    .from('vouches')
    .select('id, giver_name, giver_email, profile_id, profiles(name, slug, user_id)')
    .eq('id', id)
    .single()

  if (!vouch) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const profile = Array.isArray(vouch.profiles) ? vouch.profiles[0] : vouch.profiles
  if (!profile || (profile as { user_id: string }).user_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await db
    .from('vouches')
    .update({ status: 'approved' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  // Notify the giver
  const p = profile as { name: string; slug: string }
  await sendVouchApprovedEmail({
    to: vouch.giver_email,
    giverName: vouch.giver_name,
    candidateName: p.name,
    profileSlug: p.slug,
  }).catch(console.error)

  return NextResponse.json({ success: true })
}
