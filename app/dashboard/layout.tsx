import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase-server'
import { isProTrial, proTrialDaysLeft } from '@/lib/plans'
import { sendPushNotification } from '@/lib/push'
import DashboardShell from './DashboardShell'

export const metadata = { title: 'Dashboard' }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionId } = await auth()
  if (!userId) redirect('/sign-in')

  const db = createServiceClient()
  const { data: profile } = await db
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!profile) redirect('/onboarding')

  // ── Device verification ────────────────────────────────────────────────────
  // Only trigger if user has a push_token (mobile app installed)
  const pushToken = (profile as any).push_token
  if (pushToken && sessionId) {
    const cookieStore = await cookies()
    const verifiedKey = `verified_session_${sessionId}`
    const alreadyVerified = cookieStore.get(verifiedKey)?.value === '1'

    if (!alreadyVerified) {
      // Check if there's already a pending/approved approval for this session
      const { data: existing } = await db
        .from('device_approvals')
        .select('id, status, token')
        .eq('session_id', sessionId)
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existing?.status === 'approved') {
        // Mark in cookie so we don't check again this session
        // (cookie set via redirect — handled client-side after approval)
      } else if (!existing || existing.status === 'denied' || existing.status === 'expired') {
        // Get device info from headers
        const headersList = await headers()
        const userAgent = headersList.get('user-agent') ?? ''
        const forwardedFor = headersList.get('x-forwarded-for') ?? ''

        // Create new approval record
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min
        const { data: approval } = await db
          .from('device_approvals')
          .insert({
            profile_id: profile.id,
            session_id: sessionId,
            status: 'pending',
            device_info: { user_agent: userAgent, ip: forwardedFor },
            expires_at: expiresAt,
          })
          .select('token')
          .single()

        if (approval?.token) {
          // Send push notification to mobile
          const deviceLabel = getDeviceLabel(userAgent)
          await sendPushNotification({
            to: pushToken,
            title: 'New sign-in to your account',
            body: `${deviceLabel} is trying to sign in. Tap to approve or deny.`,
            data: { screen: 'device_approval', token: approval.token, device: deviceLabel },
          }).catch(console.error)

          redirect(`/verify-device?token=${approval.token}`)
        }
      } else if (existing?.status === 'pending') {
        // Already waiting — redirect back to verify page
        redirect(`/verify-device?token=${existing.token}`)
      }
    }
  }
  // ── End device verification ────────────────────────────────────────────────

  const { data: vouches } = await db
    .from('vouches')
    .select('verified, status')
    .eq('profile_id', profile.id)

  const allVouches = vouches ?? []
  const navBadges = {
    vouches: allVouches.filter((v) => !v.verified && v.status !== 'hidden').length,
    approvals: allVouches.filter((v) => v.status === 'pending').length,
    flagged: allVouches.filter((v) => v.status === 'flagged').length,
    billing: isProTrial(profile) && proTrialDaysLeft(profile.pro_trial_until) <= 7,
  }

  return <DashboardShell profile={profile} navBadges={navBadges}>{children}</DashboardShell>
}

function getDeviceLabel(userAgent: string): string {
  if (/iPhone/i.test(userAgent)) return 'iPhone'
  if (/iPad/i.test(userAgent)) return 'iPad'
  if (/Android/i.test(userAgent)) return 'Android device'
  if (/Macintosh/i.test(userAgent)) return 'Mac'
  if (/Windows/i.test(userAgent)) return 'Windows PC'
  return 'New device'
}
