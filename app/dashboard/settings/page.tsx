import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase-server'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const db = createServiceClient()
  const { data: profile } = await db.from('profiles').select('*').eq('user_id', userId).single()
  if (!profile) redirect('/onboarding')

  return <SettingsForm profile={profile} />
}
