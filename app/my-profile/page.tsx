import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase-server'

export default async function MyProfilePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const db = createServiceClient()
  const { data: profile } = await db
    .from('profiles')
    .select('slug')
    .eq('user_id', userId)
    .single()

  if (!profile) redirect('/onboarding')

  redirect(`/${profile.slug}`)
}
