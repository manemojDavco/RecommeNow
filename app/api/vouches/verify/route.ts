import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { calculateVouchScore } from '@/lib/vouch-score'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return new Response('Missing token', { status: 400 })
  }

  const db = createServiceClient()

  // Fetch vouch first so we can recalculate score with verified=true
  const { data: existing } = await db
    .from('vouches')
    .select('id, profile_id, giver_name, giver_relationship, giver_email, traits, quote, verified')
    .eq('verification_token', token)
    .single()

  if (!existing) {
    return new Response(
      `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:3rem;text-align:center">
        <h2>Link expired or already used</h2>
        <p>This verification link is no longer valid.</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' }, status: 400 }
    )
  }

  // Recalculate score now that email is verified
  const { score: newScore } = calculateVouchScore({
    relationship: existing.giver_relationship ?? null,
    quoteLength: (existing.quote ?? '').length,
    traitCount: (existing.traits ?? []).length,
    email: existing.giver_email ?? '',
    verified: true,
  })

  const { data: vouch, error } = await db
    .from('vouches')
    .update({ verified: true, star_rating: newScore })
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
