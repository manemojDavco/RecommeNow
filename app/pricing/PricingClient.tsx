'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import Nav from '@/components/Nav'
import { PRO_PRICES, RECRUITER_PRICES, PRO_PRICES_YEARLY, RECRUITER_PRICES_YEARLY } from '@/lib/plans'

function PlanBadge({ variant, size = 26 }: { variant: 'pro' | 'recruiter'; size?: number }) {
  const dark  = variant === 'recruiter' ? '#5B21B6' : '#2D6A4F'
  const light = variant === 'recruiter' ? '#A78BFA' : '#52B788'
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx="9" cy="10" r="4" fill={dark}/>
      <path d="M3 26 Q3 18 9 18 Q15 18 15 26 Z" fill={dark}/>
      <path d="M14 20 Q18 17 20 17" stroke={light} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <polygon points="20,17 16.5,14.5 16.5,19.5" fill={light}/>
      <circle cx="23" cy="10" r="4" fill={light}/>
      <path d="M17 26 Q17 18 23 18 Q29 18 29 26 Z" fill={light}/>
      <circle cx="28" cy="5" r="4" fill={dark}/>
      <polyline points="25.8,5 27,6.3 30.2,3" stroke="#fff" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const CURRENCY_LABELS: Record<string, string> = {
  aud: '🇦🇺 AUD',
  usd: '🇺🇸 USD',
  gbp: '🇬🇧 GBP',
  eur: '🇪🇺 EUR',
}

type PlanType = 'pro' | 'recruiter'
type Interval = 'month' | 'year'

export default function PricingClient({ isSignedIn, trial = false }: { isSignedIn: boolean; trial?: boolean }) {
  const router = useRouter()
  const [currency, setCurrency] = useState('aud')
  const [interval, setInterval] = useState<Interval>('month')
  const [loading, setLoading] = useState<PlanType | null>(null)
  const [error, setError] = useState('')

  const proPrice  = interval === 'year' ? PRO_PRICES_YEARLY[currency]       : PRO_PRICES[currency]
  const recPrice  = interval === 'year' ? RECRUITER_PRICES_YEARLY[currency] : RECRUITER_PRICES[currency]

  async function handleCheckout(planType: PlanType) {
    if (!isSignedIn) {
      const redirect = `/pricing${trial ? '?trial=1' : ''}`
      router.push(`/sign-up?redirect_url=${encodeURIComponent(redirect)}`)
      return
    }
    setLoading(planType)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency, planType, interval, trial: trial && planType === 'pro' }),
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
      <Nav />

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '4rem 1.5rem' }}>
        {/* Trial banner */}
        {trial && (
          <div style={{ background: '#d8f3dc', border: '1px solid #b2dfbf', borderRadius: 12, padding: '14px 24px', marginBottom: '2rem', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '.9rem', fontWeight: 700, color: 'var(--ink)' }}>
              Your first month of Pro is free — welcome to RecommeNow.
            </p>
            <p style={{ margin: '.3rem 0 0', fontSize: '.8rem', color: 'var(--muted)' }}>
              No charge for 30 days. Cancel anytime before your trial ends.
            </p>
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontFamily: 'var(--sans)', fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 700, color: 'var(--ink)', marginBottom: '.75rem' }}>
            Simple, honest pricing
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 480, margin: '0 auto' }}>
            For candidates building a reputation. For recruiters searching for talent.
          </p>

          {/* Billing interval toggle */}
          <div style={{ display: 'inline-flex', gap: 0, marginTop: '1.5rem', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, padding: '.3rem', position: 'relative' }}>
            {(['month', 'year'] as const).map((i) => (
              <button
                key={i}
                onClick={() => setInterval(i)}
                style={{
                  padding: '.4rem 1rem', borderRadius: 7, border: 'none',
                  background: interval === i ? 'var(--green)' : 'transparent',
                  color: interval === i ? '#fff' : 'var(--muted)',
                  fontSize: '.78rem', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'var(--sans)', transition: 'all .15s',
                  display: 'flex', alignItems: 'center', gap: '.4rem',
                }}
              >
                {i === 'month' ? 'Monthly' : 'Yearly'}
                {i === 'year' && (
                  <span style={{ background: interval === 'year' ? 'rgba(255,255,255,.2)' : 'var(--green-l)', color: interval === 'year' ? '#fff' : 'var(--green2)', fontSize: '.62rem', fontWeight: 700, padding: '.1rem .45rem', borderRadius: 100, letterSpacing: '.04em' }}>
                    Save 17%
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Currency selector */}
          <div style={{ display: 'inline-flex', gap: '.4rem', marginTop: '.75rem', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, padding: '.3rem' }}>
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
              <div style={{ fontFamily: 'var(--sans)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>$0</div>
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
          <div style={{ background: 'var(--cream)', border: '1px solid #ddd5b8', borderRadius: 16, padding: '2rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 14, right: 16, background: 'var(--ink)', color: '#fff', fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '.25rem .6rem', borderRadius: 100 }}>
              Most popular
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
                <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>Pro</div>
                <PlanBadge variant="pro" size={22} />
              </div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>
                {proPrice.display.split(' ')[0]}
              </div>
              {interval === 'year' ? (
                <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.4rem' }}>
                  {currency.toUpperCase()} / year &nbsp;·&nbsp; <span style={{ color: 'var(--muted)', opacity: 0.7 }}>{'monthly' in proPrice ? `${(proPrice as {monthly:string}).monthly}/mo` : ''}</span>
                </div>
              ) : (
                <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.4rem' }}>{currency.toUpperCase()} / month</div>
              )}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
              {['Everything in Free', 'Unlimited vouches', 'Custom slug (your-name)', 'Embeddable widget', 'PDF one-pager', 'Priority support'].map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '.55rem', fontSize: '.82rem', color: 'var(--ink)' }}>
                  <span style={{ color: 'var(--ink2)', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => handleCheckout('pro')} disabled={loading !== null} style={{ display: 'block', width: '100%', padding: '.8rem', borderRadius: 9, border: 'none', background: 'var(--green)', color: '#fff', fontSize: '.83rem', fontWeight: 700, cursor: loading !== null ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)', opacity: loading !== null ? 0.8 : 1 }}>
              {loading === 'pro' ? 'Redirecting…' : trial ? 'Start free month →' : 'Upgrade to Pro →'}
            </button>
            <p style={{ fontSize: '.7rem', color: 'var(--muted)', textAlign: 'center', marginTop: '.6rem' }}>
              {trial ? 'Free for 30 days — no charge until trial ends' : 'Cancel anytime'}
            </p>
          </div>
        </div>

        {/* ── FOR RECRUITERS ── */}
        <p id="recruiter" style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem', textAlign: 'center' }}>
          For recruiters
        </p>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <div style={{ background: 'var(--green-l)', border: '1px solid #b2dfbf', borderRadius: 16, padding: '2rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
                <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>Recruiter</div>
                <PlanBadge variant="recruiter" size={22} />
                <span style={{ background: 'var(--ink)', color: '#fff', fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '.2rem .55rem', borderRadius: 100 }}>New</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '.5rem', marginBottom: '.4rem' }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>
                  {recPrice.display.split(' ')[0]}
                </div>
                {interval === 'year' ? (
                  <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
                    {currency.toUpperCase()} / year &nbsp;·&nbsp; {'monthly' in recPrice ? `${(recPrice as {monthly:string}).monthly}/mo` : ''}
                  </div>
                ) : (
                  <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{currency.toUpperCase()} / month</div>
                )}
              </div>
              <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.75rem', marginBottom: '.5rem' }}>
                Includes everything in Pro, plus:
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem .75rem' }}>
                {[
                  'Full talent directory access',
                  'Advanced search & filters',
                  'Contact candidates directly',
                  'Message delivered by email',
                  'View full vouch history',
                  'Candidate reply-to link',
                ].map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.8rem', color: 'var(--ink)' }}>
                    <span style={{ color: 'var(--ink2)', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ flexShrink: 0 }}>
              <button onClick={() => handleCheckout('recruiter')} disabled={loading !== null} style={{ display: 'block', padding: '.9rem 2rem', borderRadius: 9, border: 'none', background: 'var(--ink)', color: '#fff', fontSize: '.85rem', fontWeight: 700, cursor: loading !== null ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)', whiteSpace: 'nowrap', opacity: loading !== null ? 0.8 : 1 }}>
                {loading === 'recruiter' ? 'Redirecting…' : 'Get Recruiter access →'}
              </button>
              <p style={{ fontSize: '.7rem', color: 'var(--muted)', textAlign: 'center', marginTop: '.6rem' }}>Cancel anytime</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 560, margin: '4rem auto 0', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {[
            { q: 'Can I be both a Pro candidate and a Recruiter?', a: 'Yes, they are separate subscriptions. You can build your own profile as a Pro candidate and also use Recruiter access to browse and contact others.' },
            { q: 'Can I cancel at any time?', a: 'Yes. Cancel from your dashboard billing settings. You keep access until the end of the billing period.' },
            { q: 'How does "Contact candidate" work?', a: 'You write a short message and it\'s delivered to the candidate by email. They can reply directly to you. We never share their email address with you.' },
            { q: 'What happens to my vouches if I downgrade from Pro?', a: 'All vouches remain. Only the first 10 approved ones will show publicly until you re-upgrade.' },
            { q: 'Is the yearly plan charged all at once?', a: 'Yes. Choosing yearly bills the full annual amount upfront (equal to 10 months of the monthly price). You save ~17% compared to paying monthly.' },
          ].map(({ q, a }) => (
            <div key={q}>
              <p style={{ fontWeight: 600, fontSize: '.85rem', color: 'var(--ink)', marginBottom: '.35rem' }}>{q}</p>
              <p style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.6 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer — matches home page */}
      <footer style={{
        padding: '2.5rem',
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid var(--rule)',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Brand + social */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
          <Logo variant="dark" href="/" size={22} />
          <a href="https://www.instagram.com/recommenow" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://www.linkedin.com/company/recommenow" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        </div>

        {/* Get the app — hidden until app is ready */}
        <div style={{ display: 'none' }}>
          <div>
            <p style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '.4rem' }}>Get the app</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=72x72&color=1a4231&bgcolor=ffffff&data=${encodeURIComponent('https://recommenow.com')}&qzone=1`}
              alt="Download app QR"
              width={72}
              height={72}
              style={{ borderRadius: 8, border: '1px solid var(--rule)', display: 'block' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            <a href="https://apps.apple.com/app/recommenow" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: '#000', color: '#fff', borderRadius: 7, padding: '.35rem .7rem', textDecoration: 'none', fontSize: '.62rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              App Store
            </a>
            <a href="https://play.google.com/store/apps/recommenow" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: '#000', color: '#fff', borderRadius: 7, padding: '.35rem .7rem', textDecoration: 'none', fontSize: '.62rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.64.24.99.21l12.47-7.2-2.75-2.75-10.71 9.74zM.48 1.61C.18 1.94 0 2.44 0 3.09v17.82c0 .65.18 1.15.49 1.48l.08.07 9.98-9.98v-.24L.56 1.54l-.08.07zM20.12 10.1l-2.83-1.63-3.08 3.08 3.08 3.08 2.85-1.64c.81-.47.81-1.23-.02-1.89zM3.18.24L15.65 7.44l-2.75 2.75L2.19.45c.28-.23.64-.3.99-.21z"/></svg>
              Google Play
            </a>
          </div>
        </div>

        {/* Copyright */}
        <p style={{ fontSize: '.72rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
          © {new Date().getFullYear()} RecommeNow
          <span style={{ opacity: .4 }}>·</span>
          <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy Policy</Link>
          <span style={{ opacity: .4 }}>·</span>
          <Link href="/terms" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Terms of Use</Link>
        </p>
      </footer>
    </div>
  )
}
