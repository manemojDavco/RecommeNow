import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const db = createServiceClient()

  const { data } = await db
    .from('device_approvals')
    .select('status, expires_at')
    .eq('token', token)
    .single()

  if (!data) return NextResponse.json({ status: 'not_found' })
  if (new Date(data.expires_at) < new Date()) return NextResponse.json({ status: 'expired' })

  return NextResponse.json({ status: data.status })
}
