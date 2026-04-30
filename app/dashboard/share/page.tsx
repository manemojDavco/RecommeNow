import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase-server'
import ShareEmbed from './ShareEmbed'

export default async function SharePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const db = createServiceClient()
  const { data: profile } = await db.from('profiles').select('*').eq('user_id', userId).single()
  if (!profile) redirect('/onboarding')

  return <ShareEmbed profile={profile} />
}
