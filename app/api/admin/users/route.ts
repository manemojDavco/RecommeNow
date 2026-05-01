import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server'
import { adminDb } from '@/lib/admin'

async function checkAdmin() {
  const { userId } = await auth()
  if (!userId) return false
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ''
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
  return adminEmails.includes(email.toLowerCase())
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const db = adminDb()

  const { data: profiles } = await db
    .from('profiles')
    .select('id, user_id, name, slug, plan, recruiter_active, referral_count, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  // Fetch emails from Clerk in bulk
  const clerk = await clerkClient()
  const userIds = (profiles ?? []).map(p => p.user_id).filter(Boolean)
  const emailMap: Record<string, string> = {}

  if (userIds.length > 0) {
    try {
      const { data: clerkUsers } = await clerk.users.getUserList({ userId: userIds, limit: 100 })
      for (const u of clerkUsers) {
        emailMap[u.id] = u.emailAddresses?.[0]?.emailAddress ?? ''
      }
    } catch {}
  }

  const users = (profiles ?? []).map(p => ({
    ...p,
    email: emailMap[p.user_id] ?? '',
  }))

  return NextResponse.json({ users })
}

export async function PATCH(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { userId, plan, recruiter_active } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const db = adminDb()
  const update: Record<string, unknown> = {}
  if (plan !== undefined) update.plan = plan
  if (recruiter_active !== undefined) update.recruiter_active = recruiter_active

  const { error } = await db.from('profiles').update(update).eq('user_id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
