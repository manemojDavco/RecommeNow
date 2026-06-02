// GET  /api/settings/emails  — list connected emails for current user
// POST /api/settings/emails  — add a new email and send verification
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'
import { sendConnectedEmailVerification } from '@/lib/email'
import { randomBytes } from 'crypto'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('user_emails')
    .select('id, email, verified, archived, verified_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 })
  return NextResponse.json({ emails: data ?? [] })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const email = (body.email ?? '').trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // Don't allow adding the primary Clerk email as a connected email
  const user = await currentUser()
  const primaryEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase()
  if (email === primaryEmail) {
    return NextResponse.json({ error: 'This is already your primary account email' }, { status: 400 })
  }

  const db = createServiceClient()

  // Check if already added
  const { data: existing } = await db
    .from('user_emails')
    .select('id, verified')
    .eq('user_id', userId)
    .eq('email', email)
    .single()

  if (existing) {
    if (existing.verified) {
      return NextResponse.json({ error: 'This email is already connected to your account' }, { status: 400 })
    }
    // Resend verification for unverified email
    const token = randomBytes(32).toString('hex')
    await db.from('user_emails').update({ verification_token: token }).eq('id', existing.id)
    const userName = user?.firstName ?? 'there'
    await sendConnectedEmailVerification({ to: email, userName, token })
    return NextResponse.json({ message: 'Verification email resent' })
  }

  const token = randomBytes(32).toString('hex')
  const { error } = await db.from('user_emails').insert({
    user_id: userId,
    email,
    verified: false,
    archived: false,
    verification_token: token,
  })

  if (error) return NextResponse.json({ error: 'Failed to add email' }, { status: 500 })

  const userName = user?.firstName ?? 'there'
  await sendConnectedEmailVerification({ to: email, userName, token })

  return NextResponse.json({ message: 'Verification email sent' })
}
