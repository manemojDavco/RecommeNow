import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
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

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalUsers },
    { count: proUsers },
    { count: recruiterUsers },
    { count: totalVouches },
    { count: approvedVouches },
    { count: flaggedVouches },
    { count: newUsersWeek },
    { count: waitlistCount },
  ] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('profiles').select('*', { count: 'exact', head: true }).eq('plan', 'pro'),
    db.from('profiles').select('*', { count: 'exact', head: true }).eq('recruiter_active', true),
    db.from('vouches').select('*', { count: 'exact', head: true }),
    db.from('vouches').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    db.from('vouches').select('*', { count: 'exact', head: true }).eq('status', 'flagged'),
    db.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
    db.from('waitlist').select('*', { count: 'exact', head: true }),
  ])

  return NextResponse.json({
    totalUsers, proUsers, recruiterUsers,
    totalVouches, approvedVouches, flaggedVouches,
    newUsersWeek, waitlistCount,
  })
}
