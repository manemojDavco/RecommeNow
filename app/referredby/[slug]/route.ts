import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const response = NextResponse.redirect(new URL('/sign-up', request.url))
  response.cookies.set('ref', slug, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: false,
  })
  return response
}
