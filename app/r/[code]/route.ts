import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const response = NextResponse.redirect(new URL('/sign-up', request.url))
  response.cookies.set('ref', code, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: false,
  })
  return response
}
