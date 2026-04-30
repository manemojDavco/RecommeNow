import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase-server'
import OnboardingWizard from './OnboardingWizard'

export const metadata = { title: 'Build your profile' }

export default async function OnboardingPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // If user already has a profile, send to dashboard
  const db = createServiceClient()
  const { data: profile } = await db.from('profiles').select('id').eq('user_id', userId).single()
  if (profile) redirect('/dashboard')

  return <OnboardingWizard />
}
