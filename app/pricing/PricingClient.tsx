'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PRO_PRICES, RECRUITER_PRICES } from '@/lib/plans'

const CURRENCY_LABELS: Record<string, string> = {
  usd: '🇺🇸 USD',
  aud: '🇦🇺 AUD',
  gbp: '🇬🇧 GBP',
  eur: '🇪🇺 EUR',
}

type PlanType = 'pro' | 'recruiter'

export default function PricingClient({ isSignedIn }: { isSignedIn: boolean }) {
  const router = useRouter()
  const [currency, setCurrency] = useState('usd')
  const [loading, setLoading] = useState<PlanType | null>(null)
  const [error, setError] = useState('')

  const proPrice = PRO_PRICES[currency]
  const recruiterPrice = RECRUITER_PRICES[currency]

  async function handleCheckout(planType: PlanType) {
    if (!isSignedIn) {
      router.push('/sign-up')
      return
    }
    setLoading(planType)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency, planType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to start checkout')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(null)
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

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '4rem 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 700, color: 'var(--ink)', marginBottom: '.75rem' }}>
            Simple, honest pricing
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 480, margin: '0 auto' }}>
            For candidates building a reputation. For recruiters searching for talent.
          </p>

          {/* Currency selector */}
          <div style={{ display: 'inline-flex', gap: '.4rem', marginTop: '1.5rem', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, padding: '.3rem' }}>
            {Object.entries(CURRENCY_LABELS).map(([code, label]) => (
              <button
                key={code}
                onClick={() => setCurrency(code)}
                style={{
                  padding: '.4rem .9rem', borderRadius: 7, border: 'none',
                  background: currency === code ? 'var(--green)' : 'transparent',
                  color: currency === code ? '#fff' : 'var(--muted)',
                  fontSize: '.75rem', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'var(--sans)', transition: 'all .15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p style={{ textAlign: 'center', fontSize: '.82rem', color: 'var(--red)', background: 'var(--red-l)', padding: '.6rem 1rem', borderRadius: 8, marginBottom: '1.5rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
            {error}
          </p>
        )}

        {/* ── FOR CANDIDATES ── */}
        <p style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem', textAlign: 'center' }}>
          For candidates
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', maxWidth: 740, marginBottom: '3rem', margin: '0 auto 3rem' }}>
          {/* Free */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 16, padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.5rem' }}>Free</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>$0</div>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.4rem' }}>forever</div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
              {['Public profile page', 'Up to 10 approved vouches', 'Email verification', 'Embed widget', 'Auto-generated slug'].map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '.55rem', fontSize: '.82rem', color: 'var(--ink)' }}>
                  <span style={{ color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <Link href={isSignedIn ? '/dashboard' : '/sign-up'} style={{ display: 'block', textAlign: 'center', padding: '.8rem', borderRadius: 9, border: '1.5px solid var(--rule)', fontSize: '.83rem', fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}>
              {isSignedIn ? 'Current plan' : 'Get started free'}
            </Link>
          </div>

          {/* Pro */}
          <div style={{ background: 'var(--green)', border: '1px solid var(--green)', borderRadius: 16, padding: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 14, right: 16, background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '.25rem .6rem', borderRadius: 100 }}>
              Most popular
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)', marginBottom: '.5rem' }}>Pro</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{proPrice.display.split(' ')[0]}</div>
              <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.6)', marginTop: '.4rem' }}>{currency.toUpperCase()} / month</div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
              {['Everything in Free', 'Unlimited vouches', 'Custom slug (your-name)', 'Priority support'].map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '.55rem', fontSize: '.82rem', color: '#fff' }}>
                  <span style={{ color: 'rgba(255,255,255,.7)', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => handleCheckout('pro')} disabled={loading !== null} style={{ display: 'block', width: '100%', padding: '.8rem', borderRadius: 9, border: 'none', background: '#fff', color: 'var(--green)', fontSize: '.83rem', fontWeight: 700, cursor: loading !== null ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)', opacity: loading !== null ? 0.8 : 1 }}>
              {loading === 'pro' ? 'Redirecting…' : 'Upgrade to Pro →'}
            </button>
          </div>
        </div>

        {/* ── FOR RECRUITERS ── */}
        <p id="recruiter" style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem', textAlign: 'center' }}>
          For recruiters
        </p>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <div style={{ background: 'var(--ink)', border: '1px solid var(--ink)', borderRadius: 16, padding: '2rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
                <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>Recruiter</div>
                <span style={{ background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.7)', fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '.2rem .55rem', borderRadius: 100 }}>New</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '.5rem', marginBottom: '.4rem' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{recruiterPrice.display.split(' ')[0]}</div>
                <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.5)' }}>{currency.toUpperCase()} / month</div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '1.25rem 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem .75rem' }}>
                {[
                  'Full talent directory access',
                  'Advanced search & filters',
                  'Contact candidates directly',
                  'Message delivered by email',
                  'View full vouch history',
                  'Candidate reply-to link',
                ].map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.8rem', color: 'rgba(255,255,255,.75)' }}>
                    <span style={{ color: 'rgba(255,255,255,.4)', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ flexShrink: 0 }}>
              <button onClick={() => handleCheckout('recruiter')} disabled={loading !== null} style={{ display: 'block', padding: '.9rem 2rem', borderRadius: 9, border: 'none', background: '#fff', color: 'var(--ink)', fontSize: '.85rem', fontWeight: 700, cursor: loading !== null ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)', whiteSpace: 'nowrap', opacity: loading !== null ? 0.8 : 1 }}>
                {loading === 'recruiter' ? 'Redirecting…' : 'Get Recruiter access →'}
              </button>
              <p style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.35)', textAlign: 'center', marginTop: '.6rem' }}>Cancel anytime</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 560, margin: '4rem auto 0', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {[
            { q: 'Can I be both a Pro candidate and a Recruiter?', a: 'Yes — they are separate subscriptions. You can build your own profile as a Pro candidate and also use Recruiter access to browse and contact others.' },
            { q: 'Can I cancel at any time?', a: 'Yes. Cancel from your dashboard billing settings. You keep access until the end of the billing period.' },
            { q: 'How does "Contact candidate" work?', a: 'You write a short message and it\'s delivered to the candidate by email. They can reply directly to you — we never share their email address with you.' },
            { q: 'What happens to my vouches if I downgrade from Pro?', a: 'All vouches remain. Only the first 10 approved ones will show publicly until you re-upgrade.' },
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
