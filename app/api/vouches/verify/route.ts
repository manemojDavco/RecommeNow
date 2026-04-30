import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return new Response('Missing token', { status: 400 })
  }

  const db = createServiceClient()

  const { data: vouch, error } = await db
    .from('vouches')
    .update({ verified: true })
    .eq('verification_token', token)
    .select('id, profile_id, giver_name')
    .single()

  if (error || !vouch) {
    return new Response(
      `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:3rem;text-align:center">
        <h2>Link expired or already used</h2>
        <p>This verification link is no longer valid.</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' }, status: 400 }
    )
  }

  // Redirect to a thank-you page
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'
  return NextResponse.redirect(`${appUrl}/vouch-verified`)
}
