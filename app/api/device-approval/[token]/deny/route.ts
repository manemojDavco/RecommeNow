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
    .select('id, status, expires_at')
    .eq('token', token)
    .single()

  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (data.status !== 'pending') return NextResponse.json({ error: 'Already actioned' }, { status: 409 })

  await db.from('device_approvals').update({ status: 'denied' }).eq('id', data.id)

  return NextResponse.json({ ok: true })
}
