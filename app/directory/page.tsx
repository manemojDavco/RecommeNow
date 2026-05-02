import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase-server'
import DirectoryClient from './DirectoryClient'

export const metadata: Metadata = {
  title: 'Talent Directory',
  description: 'Browse verified professionals with real peer vouches from managers, clients and colleagues.',
}

export default async function DirectoryPage() {
  const { userId } = await auth()

  // Not signed in — redirect to sign-in
  if (!userId) redirect('/sign-in')

  const db = createServiceClient()

  // Check recruiter status
  const { data: profile } = await db
    .from('profiles')
    .select('recruiter_active, plan')
    .eq('user_id', userId)
    .single()

  const isRecruiter = profile?.recruiter_active === true

  // Not a recruiter — show upgrade wall instead of the directory
  if (!isRecruiter) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--sans)', display: 'flex', flexDirection: 'column' }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid var(--rule)', background: 'var(--white)' }}>
          <Link href="/" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--ink)', textDecoration: 'none' }}>
            Recomme<span style={{ color: 'var(--green)' }}>Now</span>
          </Link>
          <Link href="/dashboard" style={{ fontSize: '.82rem', color: 'var(--muted)', textDecoration: 'none' }}>← Dashboard</Link>
        </nav>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-l)', border: '2px solid var(--green-m)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem' }}>
              ⊛
            </div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.75rem', lineHeight: 1.2 }}>
              Talent Directory
            </h1>
            <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
              Browse verified professionals by industry, location, and availability. The directory is available on the Recruiter plan.
            </p>
            <Link
              href="/pricing"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--green)', color: '#fff', borderRadius: 8, padding: '.8rem 1.6rem', fontSize: '.85rem', fontWeight: 600, textDecoration: 'none' }}
            >
              View Recruiter plan →
            </Link>
            <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '1rem' }}>
              Already subscribed?{' '}
              <Link href="/dashboard/settings" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>Check your billing settings</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Recruiter — show full directory
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
          <Link href="/dashboard" style={{ fontSize: '.82rem', color: 'var(--muted)', textDecoration: 'none' }}>← Dashboard</Link>
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
