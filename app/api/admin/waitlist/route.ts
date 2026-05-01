import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const db = adminDb()
  const { searchParams } = new URL(req.url)

  const { data } = await db.from('waitlist').select('id, email, source, created_at').order('created_at', { ascending: false })

  if (searchParams.get('format') === 'csv') {
    const csv = ['Email,Source,Joined'].concat(
      (data ?? []).map(r => `${r.email},${r.source},${r.created_at}`)
    ).join('\n')
    return new NextResponse(csv, {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="waitlist.csv"' },
    })
  }

  return NextResponse.json({ waitlist: data, total: data?.length ?? 0 })
}

export async function DELETE(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const db = adminDb()
  await db.from('waitlist').delete().eq('id', id)
  return NextResponse.json({ ok: true })
}
