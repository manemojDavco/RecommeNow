import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase-server'
import { FREE_VOUCH_LIMIT } from '@/lib/plans'
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
    .select('id, name, slug, title, years_experience, plan')
    .eq('slug', slug)
    .single()

  if (!profile) notFound()

  // FREE profiles can receive at most FREE_VOUCH_LIMIT vouches (any status).
  // When the limit is reached the vouch link is no longer active, so we show a
  // closed state up front instead of letting visitors fill out the whole form
  // only to be rejected on submit. The server still hard-blocks on submit.
  if ((profile.plan ?? 'free') === 'free') {
    const { count } = await db
      .from('vouches')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profile.id)

    if ((count ?? 0) >= FREE_VOUCH_LIMIT) {
      return <VouchClosed name={profile.name} />
    }
  }

  return <VouchForm profile={profile} />
}

function VouchClosed({ name }: { name: string }) {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f9fafb' }}>
      <div style={{ maxWidth: 440, width: '100%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
          {name} is not accepting new vouches right now
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
          This profile is on the free plan and has reached its vouch limit. Ask {name} to upgrade to Pro or Recruiter to receive more vouches.
        </p>
      </div>
    </main>
  )
}
