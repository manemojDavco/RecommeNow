import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase-server'
import { isProTrial, proTrialDaysLeft } from '@/lib/plans'
import DashboardShell from './DashboardShell'

export const metadata = { title: 'Dashboard' }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const db = createServiceClient()
  const { data: profile } = await db
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!profile) redirect('/onboarding')

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
