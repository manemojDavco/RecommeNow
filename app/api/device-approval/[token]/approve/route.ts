import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const db = createServiceClient()

  const { data } = await db
    .from('device_approvals')
    .select('id, status, expires_at, session_id')
    .eq('token', token)
    .single()

  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (new Date(data.expires_at) < new Date()) return NextResponse.json({ error: 'Expired' }, { status: 410 })
  if (data.status !== 'pending') return NextResponse.json({ error: 'Already actioned' }, { status: 409 })

  await db.from('device_approvals').update({ status: 'approved' }).eq('id', data.id)

  const res = NextResponse.json({ ok: true })
  // Set a long-lived cookie so this session isn't re-challenged
  if (data.session_id) {
    res.cookies.set(`verified_session_${data.session_id}`, '1', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
  }
  return res
}
