// DELETE /api/settings/emails/[id]  — remove an unverified email
// PATCH  /api/settings/emails/[id]  — toggle archive on a verified email
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = createServiceClient()

  // Only allow deleting own emails
  const { error } = await db
    .from('user_emails')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: 'Failed to remove email' }, { status: 500 })
  return NextResponse.json({ message: 'Email removed' })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { archived } = body

  const db = createServiceClient()
  const { error } = await db
    .from('user_emails')
    .update({ archived })
    .eq('id', id)
    .eq('user_id', userId)
    .eq('verified', true) // can only archive verified emails

  if (error) return NextResponse.json({ error: 'Failed to update email' }, { status: 500 })
  return NextResponse.json({ message: 'Email updated' })
}
