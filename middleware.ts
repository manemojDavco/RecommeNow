import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// LAUNCH LOCK — set to false on launch day
const LOCKED = process.env.NODE_ENV === 'production'
const ALLOWED_PATHS = ['/coming-soon', '/api/waitlist']

export default clerkMiddleware(async (_auth, req: NextRequest) => {
  if (LOCKED && !ALLOWED_PATHS.some(p => req.nextUrl.pathname === p || req.nextUrl.pathname.startsWith(p + '/'))) {
    const url = req.nextUrl.clone()
    url.pathname = '/coming-soon'
    return NextResponse.redirect(url)
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
