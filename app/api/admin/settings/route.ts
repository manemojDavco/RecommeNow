import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { adminDb, setSiteSetting } from '@/lib/admin'

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
  const { data } = await db.from('site_settings').select('key, value').order('key')
  return NextResponse.json({ settings: data })
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { key, value } = await req.json()
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })
  await setSiteSetting(key, value ?? '')
  return NextResponse.json({ ok: true })
}
