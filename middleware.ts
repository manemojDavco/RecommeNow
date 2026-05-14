import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboarding(.*)',
  '/admin(.*)',
  '/directory(.*)',
])

// In coming-soon mode ONLY these routes stay accessible.
// Everything else → /coming-soon redirect.
const isAlwaysAllowed = createRouteMatcher([
  '/coming-soon',
  '/api(.*)',        // webhooks, waitlist, cron — must never be blocked
  '/admin(.*)',      // internal admin panel
  '/sign-in(.*)',   // Clerk auth — needed to log in to admin
  '/sign-up(.*)',   // Clerk auth
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Coming-soon gate: block unauthenticated visitors unless route is always allowed
  if (process.env.COMING_SOON === 'true' && !isAlwaysAllowed(req)) {
    const { userId } = await auth()
    if (!userId) {
      const url = req.nextUrl.clone()
      url.pathname = '/coming-soon'
      return NextResponse.redirect(url)
    }
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
