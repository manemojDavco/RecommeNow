import { clerkMiddleware, getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// LAUNCH LOCK — site is live
const LOCKED = false
const ALLOWED_PATHS = ['/coming-soon', '/api/waitlist']

// Routes that are protected and need device verification
const PROTECTED_PREFIXES = ['/dashboard', '/settings', '/onboarding']

// Routes that are always public (never trigger device check)
const PUBLIC_PREFIXES = [
  '/sign-in', '/sign-up', '/verify-device', '/api/', '/_next',
  '/vouch/', '/favicon', '/logo', '/coming-soon',
]

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (LOCKED && !ALLOWED_PATHS.some(p => req.nextUrl.pathname === p || req.nextUrl.pathname.startsWith(p + '/'))) {
    const url = req.nextUrl.clone()
    url.pathname = '/coming-soon'
    return NextResponse.redirect(url)
  }

  const { userId, sessionId } = await auth()
  const path = req.nextUrl.pathname

  // Only check protected routes for signed-in users
  const isProtected = PROTECTED_PREFIXES.some(p => path === p || path.startsWith(p + '/'))
  if (!userId || !sessionId || !isProtected) return NextResponse.next()

  // Already verified this session via cookie
  const verifiedCookie = req.cookies.get(`verified_session_${sessionId}`)?.value
  if (verifiedCookie === '1') return NextResponse.next()

  // Already on verify-device page — let through
  if (path.startsWith('/verify-device')) return NextResponse.next()

  // Call internal check API to see if verification is needed
  // We do this inline to avoid a redirect loop
  try {
    const checkUrl = new URL('/api/device-approval/check', req.url)
    const checkRes = await fetch(checkUrl.toString(), {
      headers: {
        cookie: req.headers.get('cookie') ?? '',
        'user-agent': req.headers.get('user-agent') ?? '',
        'x-forwarded-for': req.headers.get('x-forwarded-for') ?? '',
      },
    })

    if (checkRes.ok) {
      const data = await checkRes.json()
      if (data.required && data.token) {
        const url = req.nextUrl.clone()
        url.pathname = '/verify-device'
        url.searchParams.set('token', data.token)
        url.searchParams.set('next', path)
        return NextResponse.redirect(url)
      }
    }
  } catch {
    // If check fails, let through — don't block the user
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
