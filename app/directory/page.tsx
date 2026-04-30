import type { Metadata } from 'next'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase-server'
import DirectoryClient from './DirectoryClient'

export const metadata: Metadata = {
  title: 'Talent Directory',
  description: 'Browse verified professionals with real peer vouches from managers, clients and colleagues.',
}

export default async function DirectoryPage() {
  const db = createServiceClient()
  const { data } = await db
    .from('public_directory')
    .select('*')
    .order('vouch_count', { ascending: false })
    .limit(24)

  const initial = data ?? []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--sans)' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid var(--rule)', background: 'var(--white)' }}>
        <Link href="/" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--ink)', textDecoration: 'none' }}>
          Recomme<span style={{ color: 'var(--green)' }}>Now</span>
        </Link>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/pricing" style={{ fontSize: '.82rem', color: 'var(--muted)', textDecoration: 'none' }}>Pricing</Link>
          <Link href="/sign-up" style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--green)', textDecoration: 'none' }}>Build your profile →</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '.5rem' }}>
            Talent directory
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 700, color: 'var(--ink)', marginBottom: '.6rem' }}>
            Professionals with verified reputations
          </h1>
          <p style={{ fontSize: '.9rem', color: 'var(--muted)', maxWidth: 520 }}>
            Every profile here has real vouches from managers, clients and colleagues — verified by email.
          </p>
        </div>

        <DirectoryClient initial={initial} />
      </div>
    </div>
  )
}
