'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import SiteFooter from '@/components/SiteFooter'
import { PLAN_TIERS, PLAN_PRICES, type PlanTier, type Currency, type Interval } from '@/lib/plans'

const CURRENCY_LABELS: Record<Currency, string> = {
  aud: '🇦🇺 AUD', usd: '🇺🇸 USD', gbp: '🇬🇧 GBP', eur: '🇪🇺 EUR',
}
const CURRENCY_ORDER: Currency[] = ['aud', 'usd', 'gbp', 'eur']

// Plans shown as table columns (in order).
const COLS: PlanTier[] = ['free', 'member', 'pro', 'proplus', 'recruiter']
type PaidPlan = 'member' | 'pro' | 'proplus' | 'recruiter'

// Strip the trailing currency code from a display string ("€2.99 EUR" -> "€2.99").
const short = (display: string) => display.split(' ').slice(0, -1).join(' ')

const Check = () => <span style={{ color: 'var(--green)', fontWeight: 800 }}>✓</span>
const Dash = () => <span style={{ color: 'var(--muted)', opacity: 0.5 }}>—</span>

// Two-tone badge colours + solid button colour per tier (match app / public profile).
const BADGE_PAIRS: Record<string, [string, string]> = {
  member: ['#B0885A', '#D9C0A3'], pro: ['#2D6A4F', '#52B788'],
  proplus: ['#C8931F', '#F1D28A'], recruiter: ['#5B21B6', '#A78BFA'],
}
const BTN_COLOR: Record<string, string> = { member: '#B0885A', pro: '#2D6A4F', proplus: '#C8931F', recruiter: '#5B21B6' }

// The exact plan badge used across the app (two people + Approved check).
function PlanMark({ tier, size = 24 }: { tier: string; size?: number }) {
  const [dark, light] = BADGE_PAIRS[tier] ?? BADGE_PAIRS.pro
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx="9" cy="10" r="4" fill={dark} />
      <path d="M3 26 Q3 18 9 18 Q15 18 15 26 Z" fill={dark} />
      <path d="M14 20 Q18 17 20 17" stroke={light} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <polygon points="20,17 16.5,14.5 16.5,19.5" fill={light} />
      <circle cx="23" cy="10" r="4" fill={light} />
      <path d="M17 26 Q17 18 23 18 Q29 18 29 26 Z" fill={light} />
      <circle cx="28" cy="5" r="4" fill={dark} />
      <polyline points="25.8,5 27,6.3 30.2,3" stroke="#fff" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// The full RecommeNow brand mark (dark-green icon) for the table corner.
function BrandMark({ size = 46 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: 'block' }}>
      <rect width="32" height="32" rx="7" fill="#2D6A4F" />
      <circle cx="9" cy="10" r="4" fill="#F0EAD6" />
      <path d="M3 26 Q3 18 9 18 Q15 18 15 26 Z" fill="#F0EAD6" />
      <path d="M14 20 Q18 17 20 17" stroke="#95D5B2" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <polygon points="20,17 16.5,14.5 16.5,19.5" fill="#95D5B2" />
      <circle cx="23" cy="10" r="4" fill="#95D5B2" />
      <path d="M17 26 Q17 18 23 18 Q29 18 29 26 Z" fill="#95D5B2" />
      <circle cx="28" cy="5" r="4" fill="#F0EAD6" />
      <polyline points="25.8,5 27,6.3 30.2,3" stroke="#2D6A4F" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PricingClient({ isSignedIn }: { isSignedIn: boolean; trial?: boolean }) {
  const router = useRouter()
  const [currency, setCurrency] = useState<Currency>('aud')
  const [interval, setInterval] = useState<Interval>('month')
  const [loading, setLoading] = useState<PlanTier | null>(null)
  const [error, setError] = useState('')

  function priceFor(plan: PaidPlan) {
    return PLAN_PRICES[plan][interval][currency]
  }

  async function handleChoose(plan: PlanTier) {
    if (plan === 'free') {
      router.push(isSignedIn ? '/dashboard' : '/sign-up')
      return
    }
    if (!isSignedIn) {
      router.push(`/sign-up?redirect_url=${encodeURIComponent('/pricing')}`)
      return
    }
    setLoading(plan); setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency, planType: plan, interval }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to start checkout')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(null)
    }
  }

  const cell: React.CSSProperties = { padding: '.85rem .75rem', textAlign: 'center', borderBottom: '1px solid var(--rule)', fontSize: '.85rem' }
  const rowLabel: React.CSSProperties = { padding: '.85rem .75rem', textAlign: 'left', borderBottom: '1px solid var(--rule)', fontSize: '.85rem', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }
  // Highlight the whole Pro column green (the recommended plan).
  const PRO_BG = 'var(--green-l, #eaf5ee)'
  const proCell = (p: PlanTier): React.CSSProperties => (p === 'pro' ? { background: PRO_BG } : {})

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--sans)' }}>
      <Nav />
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '4rem 1.5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 700, color: 'var(--ink)', marginBottom: '.75rem' }}>Simple, honest pricing</h1>
          <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 520, margin: '0 auto' }}>Receive as many vouches as you like. Publish the number your plan allows. Choose the plan that fits.</p>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', background: 'var(--paper2, #f1efe8)', borderRadius: 999, padding: 4, border: '1px solid var(--rule)' }}>
            {(['month', 'year'] as Interval[]).map(i => (
              <button key={i} onClick={() => setInterval(i)} style={{
                border: 'none', cursor: 'pointer', borderRadius: 999, padding: '.4rem 1rem', fontSize: '.82rem', fontWeight: 700,
                background: interval === i ? 'var(--green)' : 'transparent', color: interval === i ? '#fff' : 'var(--muted)',
                display: 'flex', alignItems: 'center', gap: '.4rem',
              }}>
                {i === 'month' ? 'Monthly' : 'Yearly'}
                {i === 'year' && (
                  <span style={{ background: interval === 'year' ? 'rgba(255,255,255,.2)' : 'var(--green-l, #d8f3dc)', color: interval === 'year' ? '#fff' : 'var(--green)', fontSize: '.62rem', fontWeight: 700, padding: '.1rem .45rem', borderRadius: 100 }}>Save 17%</span>
                )}
              </button>
            ))}
          </div>
          <div style={{ display: 'inline-flex', background: 'var(--paper2, #f1efe8)', borderRadius: 999, padding: 4, border: '1px solid var(--rule)' }}>
            {CURRENCY_ORDER.map(code => (
              <button key={code} onClick={() => setCurrency(code)} style={{
                border: 'none', cursor: 'pointer', borderRadius: 999, padding: '.4rem .75rem', fontSize: '.78rem', fontWeight: 700,
                background: currency === code ? 'var(--green)' : 'transparent', color: currency === code ? '#fff' : 'var(--muted)',
              }}>{CURRENCY_LABELS[code]}</button>
            ))}
          </div>
        </div>

        {error && <p style={{ textAlign: 'center', color: '#dc2626', marginBottom: '1rem', fontSize: '.85rem' }}>{error}</p>}

        {/* Comparison table */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse', background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--rule)' }}>
            <thead>
              <tr>
                <th style={{ ...rowLabel, textAlign: 'center', borderBottom: '1px solid var(--rule)', background: 'var(--paper2, #f8f7f2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}><BrandMark size={46} /></div>
                </th>
                {COLS.map(p => {
                  const def = PLAN_TIERS[p]
                  const price = p === 'free' ? null : priceFor(p as PaidPlan)
                  return (
                    <th key={p} style={{ ...cell, verticalAlign: 'top', background: p === 'pro' ? PRO_BG : 'var(--paper2, #f8f7f2)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.4rem' }}>
                        <div style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '.95rem' }}>
                          {def.name}
                        </div>
                        {p === 'free' ? (
                          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--ink)' }}>Free</div>
                        ) : (
                          <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)' }}>{short(price!.display)}</div>
                            <div style={{ fontSize: '.68rem', color: 'var(--muted)' }}>
                              {interval === 'year'
                                ? <>per year{price && 'monthly' in price ? ` · ${price.monthly}/mo` : ''}</>
                                : <>per month{p === 'recruiter' ? ' · per seat' : ''}</>}
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => handleChoose(p)}
                          disabled={loading === p}
                          style={{
                            marginTop: '.3rem', cursor: 'pointer', border: p === 'free' ? '1px solid var(--rule)' : 'none',
                            borderRadius: 9, padding: '.5rem .8rem', fontSize: '.75rem', fontWeight: 700, whiteSpace: 'nowrap',
                            background: p === 'free' ? '#fff' : (BTN_COLOR[p] ?? 'var(--green)'), color: p === 'free' ? 'var(--ink)' : '#fff',
                          }}
                        >
                          {loading === p ? '…' : p === 'free' ? 'Get started' : `Choose ${def.name}`}
                        </button>
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={rowLabel}>Public vouches</td>
                {COLS.map(p => <td key={p} style={{ ...cell, ...proCell(p), fontWeight: 700 }}>{PLAN_TIERS[p].publicVouchCap}</td>)}
              </tr>
              <tr>
                <td style={rowLabel}>Profile badge</td>
                {COLS.map(p => <td key={p} style={{ ...cell, ...proCell(p) }}>{PLAN_TIERS[p].badgeColor ? <PlanMark tier={p} size={26} /> : <Dash />}</td>)}
              </tr>
              <tr>
                <td style={rowLabel}>QR code</td>
                {COLS.map(p => <td key={p} style={{ ...cell, ...proCell(p) }}>{PLAN_TIERS[p].canQR ? <Check /> : <Dash />}</td>)}
              </tr>
              <tr>
                <td style={rowLabel}>PDF one-pager (print)</td>
                {COLS.map(p => <td key={p} style={{ ...cell, ...proCell(p) }}>{PLAN_TIERS[p].canPrint ? <Check /> : <Dash />}</td>)}
              </tr>
              <tr>
                <td style={rowLabel}>Talent directory</td>
                {COLS.map(p => <td key={p} style={{ ...cell, ...proCell(p), borderBottom: 'none' }}>{PLAN_TIERS[p].hasDirectory ? <Check /> : <Dash />}</td>)}
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td style={{ ...rowLabel, borderBottom: 'none' }}></td>
                {COLS.map(p => (
                  <td key={p} style={{ ...cell, ...proCell(p), borderBottom: 'none', paddingTop: 0, paddingBottom: '.9rem', verticalAlign: 'top' }}>
                    {p === 'pro' ? (
                      <span style={{ fontSize: '.72rem', fontWeight: 800, letterSpacing: '.04em', color: 'var(--green)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>★ Recommended</span>
                    ) : null}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.78rem', marginTop: '1.5rem', maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
          The Free plan includes 1 vouch for one month. To keep it and receive more, choose a subscription. You can receive unlimited vouches on any paid plan. The number shown is how many you can publish on your public profile.
        </p>

      </div>
      <SiteFooter />
    </div>
  )
}
