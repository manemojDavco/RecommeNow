'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PRO_PRICES } from '@/lib/stripe'

const CURRENCY_LABELS: Record<string, string> = {
  usd: '🇺🇸 USD',
  aud: '🇦🇺 AUD',
  gbp: '🇬🇧 GBP',
  eur: '🇪🇺 EUR',
}

export default function PricingClient({ isSignedIn }: { isSignedIn: boolean }) {
  const router = useRouter()
  const [currency, setCurrency] = useState('usd')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const price = PRO_PRICES[currency]

  async function handleUpgrade() {
    if (!isSignedIn) {
      router.push('/sign-up')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to start checkout')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--sans)' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid var(--rule)', background: 'var(--white)' }}>
        <Link href="/" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--ink)', textDecoration: 'none' }}>
          Recomme<span style={{ color: 'var(--green)' }}>Now</span>
        </Link>
        <Link href={isSignedIn ? '/dashboard' : '/sign-in'} style={{ fontSize: '.82rem', color: 'var(--muted)', textDecoration: 'none' }}>
          {isSignedIn ? 'Dashboard →' : 'Sign in →'}
        </Link>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 700, color: 'var(--ink)', marginBottom: '.75rem' }}>
            Simple, honest pricing
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 480, margin: '0 auto' }}>
            Start free. Upgrade when you want a custom URL and unlimited vouches.
          </p>

          {/* Currency selector */}
          <div style={{ display: 'inline-flex', gap: '.4rem', marginTop: '1.5rem', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, padding: '.3rem' }}>
            {Object.entries(CURRENCY_LABELS).map(([code, label]) => (
              <button
                key={code}
                onClick={() => setCurrency(code)}
                style={{
                  padding: '.4rem .9rem',
                  borderRadius: 7,
                  border: 'none',
                  background: currency === code ? 'var(--green)' : 'transparent',
                  color: currency === code ? '#fff' : 'var(--muted)',
                  fontSize: '.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                  transition: 'all .15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: 740, margin: '0 auto' }}>
          {/* Free */}
          <div style={{
            background: 'var(--white)',
            border: '1px solid var(--rule)',
            borderRadius: 16,
            padding: '2rem',
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.5rem' }}>Free</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>$0</div>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.4rem' }}>forever</div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
              {[
                'Public profile page',
                'Up to 10 approved vouches',
                'Email verification',
                'Embed widget',
                'Auto-generated slug',
              ].map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '.55rem', fontSize: '.82rem', color: 'var(--ink)' }}>
                  <span style={{ color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href={isSignedIn ? '/dashboard' : '/sign-up'}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '.8rem',
                borderRadius: 9,
                border: '1.5px solid var(--rule)',
                fontSize: '.83rem',
                fontWeight: 600,
                color: 'var(--ink)',
                textDecoration: 'none',
                transition: 'border-color .15s',
              }}
            >
              {isSignedIn ? 'Current plan' : 'Get started free'}
            </Link>
          </div>

          {/* Pro */}
          <div style={{
            background: 'var(--green)',
            border: '1px solid var(--green)',
            borderRadius: 16,
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: 14,
              right: 16,
              background: 'rgba(255,255,255,.15)',
              color: '#fff',
              fontSize: '.62rem',
              fontWeight: 700,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              padding: '.25rem .6rem',
              borderRadius: 100,
            }}>
              Most popular
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)', marginBottom: '.5rem' }}>Pro</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                {price.display.split(' ')[0]}
              </div>
              <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.6)', marginTop: '.4rem' }}>{currency.toUpperCase()} / month</div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
              {[
                'Everything in Free',
                'Unlimited vouches',
                'Custom slug (your-name)',
                'Priority support',
              ].map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '.55rem', fontSize: '.82rem', color: '#fff' }}>
                  <span style={{ color: 'rgba(255,255,255,.7)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {error && (
              <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.85)', background: 'rgba(0,0,0,.15)', padding: '.5rem .8rem', borderRadius: 7, marginBottom: '.8rem' }}>
                {error}
              </p>
            )}

            <button
              onClick={handleUpgrade}
              disabled={loading}
              style={{
                display: 'block',
                width: '100%',
                padding: '.8rem',
                borderRadius: 9,
                border: 'none',
                background: '#fff',
                color: 'var(--green)',
                fontSize: '.83rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--sans)',
                opacity: loading ? 0.8 : 1,
                transition: 'opacity .15s',
              }}
            >
              {loading ? 'Redirecting…' : 'Upgrade to Pro →'}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 560, margin: '4rem auto 0', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {[
            { q: 'Can I cancel at any time?', a: 'Yes. Cancel from your dashboard billing settings. You keep Pro features until the end of the billing period.' },
            { q: 'What happens to my vouches if I downgrade?', a: 'All vouches remain. Only the first 10 approved ones will display publicly until you re-upgrade.' },
            { q: 'How does the custom slug work?', a: 'Set any available slug on your Pro plan — e.g. recommenow.com/sarah-johnson. You can change it anytime.' },
          ].map(({ q, a }) => (
            <div key={q}>
              <p style={{ fontWeight: 600, fontSize: '.85rem', color: 'var(--ink)', marginBottom: '.35rem' }}>{q}</p>
              <p style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.6 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
