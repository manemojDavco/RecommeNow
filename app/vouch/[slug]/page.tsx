import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase-server'
import VouchForm from './VouchForm'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const db = createServiceClient()
  const { data: profile } = await db.from('profiles').select('name').eq('slug', slug).single()
  if (!profile) return { title: 'Profile not found' }
  return { title: `Leave a vouch for ${profile.name}` }
}

export default async function VouchPage({ params }: Props) {
  const { slug } = await params
  const db = createServiceClient()
  const { data: profile } = await db
    .from('profiles')
    .select('id, name, slug, title, years_experience')
    .eq('slug', slug)
    .single()

  if (!profile) notFound()

  return <VouchForm profile={profile} />
}
