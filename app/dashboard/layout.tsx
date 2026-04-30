import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase-server'
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

  // If no profile yet, send to onboarding
  if (!profile) redirect('/onboarding')

  return <DashboardShell profile={profile}>{children}</DashboardShell>
}
