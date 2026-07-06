import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const clean = (code ?? '').trim().slice(0, 64)
  const response = NextResponse.redirect(new URL('/sign-up', request.url))
  // User-to-user referral cookie (existing behaviour).
  response.cookies.set('ref', clean, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: false,
  })
  // Partner-program attribution cookie. Same code, longer 90-day window and its
  // own namespace; resolved against the partners table at profile creation and
  // written once to the account. See /api/profile/create.
  response.cookies.set('rn_partner', clean, {
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
    sameSite: 'lax',
    httpOnly: false,
  })
  return response
}
