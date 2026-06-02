// GET /api/settings/emails/verify?token=xxx
// Verifies a connected email address and redirects to settings
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(`${APP_URL}/dashboard/settings?email_verified=invalid`)
  }

  const db = createServiceClient()

  const { data: row, error } = await db
    .from('user_emails')
    .select('id, verified')
    .eq('verification_token', token)
    .single()

  if (error || !row) {
    return NextResponse.redirect(`${APP_URL}/dashboard/settings?email_verified=invalid`)
  }

  if (row.verified) {
    return NextResponse.redirect(`${APP_URL}/dashboard/settings?email_verified=already`)
  }

  await db
    .from('user_emails')
    .update({ verified: true, verified_at: new Date().toISOString(), verification_token: null })
    .eq('id', row.id)

  return NextResponse.redirect(`${APP_URL}/dashboard/settings?email_verified=success`)
}
