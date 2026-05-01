import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
  '/admin(.*)',
])

// In coming-soon mode only these routes stay accessible
const isAlwaysAllowed = createRouteMatcher([
  '/coming-soon',
  '/api(.*)',
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Coming-soon gate: redirect everything except /coming-soon and /api to coming-soon page
  if (process.env.COMING_SOON === 'true' && !isAlwaysAllowed(req)) {
    const url = req.nextUrl.clone()
    url.pathname = '/coming-soon'
    return NextResponse.redirect(url)
  }

  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
