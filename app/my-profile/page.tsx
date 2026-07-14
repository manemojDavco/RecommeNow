import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase-server'
import { planHasDirectory } from '@/lib/plans'

export default async function MyProfilePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const db = createServiceClient()
  const { data: profile } = await db
    .from('profiles')
    .select('slug, plan, recruiter_active')
    .eq('user_id', userId)
    .single()

  if (!profile) redirect('/onboarding')

  // Recruiters land on the Talent Directory — their primary workspace.
  if (profile.recruiter_active || planHasDirectory(profile.plan)) redirect('/directory')

  redirect(`/${profile.slug}`)
}
