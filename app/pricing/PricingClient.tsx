'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
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

function Dot({ color }: { color: string }) {
  return <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 999, background: color, verticalAlign: 'middle' }} />
}
const Check = () => <span style={{ color: 'var(--green)', fontWeight: 800 }}>✓</span>
const Dash = () => <span style={{ color: 'var(--muted)', opacity: 0.5 }}>—</span>

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--sans)' }}>
      <Nav />
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '4rem 1.5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 700, color: 'var(--ink)', marginBottom: '.75rem' }}>Simple, honest pricing</h1>
          <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 520, margin: '0 auto' }}>Receive as many vouches as you like — publish the number your plan allows. Choose the plan that fits.</p>
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
                <th style={{ ...rowLabel, borderBottom: '1px solid var(--rule)', background: 'var(--paper2, #f8f7f2)' }}></th>
                {COLS.map(p => {
                  const def = PLAN_TIERS[p]
                  const price = p === 'free' ? null : priceFor(p as PaidPlan)
                  return (
                    <th key={p} style={{ ...cell, verticalAlign: 'top', background: p === 'pro' ? 'var(--green-l, #f0f7f2)' : 'var(--paper2, #f8f7f2)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem', fontWeight: 800, color: 'var(--ink)', fontSize: '.95rem' }}>
                          {def.badgeColor && <Dot color={def.badgeColor} />}{def.name}
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
                            background: p === 'free' ? '#fff' : 'var(--green)', color: p === 'free' ? 'var(--ink)' : '#fff',
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
                {COLS.map(p => <td key={p} style={{ ...cell, fontWeight: 700 }}>{PLAN_TIERS[p].publicVouchCap}</td>)}
              </tr>
              <tr>
                <td style={rowLabel}>Profile badge</td>
                {COLS.map(p => <td key={p} style={cell}>{PLAN_TIERS[p].badgeColor ? <Dot color={PLAN_TIERS[p].badgeColor!} /> : <Dash />}</td>)}
              </tr>
              <tr>
                <td style={rowLabel}>QR code</td>
                {COLS.map(p => <td key={p} style={cell}>{PLAN_TIERS[p].canQR ? <Check /> : <Dash />}</td>)}
              </tr>
              <tr>
                <td style={rowLabel}>PDF one-pager (print)</td>
                {COLS.map(p => <td key={p} style={cell}>{PLAN_TIERS[p].canPrint ? <Check /> : <Dash />}</td>)}
              </tr>
              <tr>
                <td style={rowLabel}>Talent directory</td>
                {COLS.map(p => <td key={p} style={{ ...cell, borderBottom: 'none' }}>{PLAN_TIERS[p].hasDirectory ? <Check /> : <Dash />}</td>)}
              </tr>
            </tbody>
          </table>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '.78rem', marginTop: '1.5rem', maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
          The Free plan includes 1 vouch for one month. To keep it and receive more, choose a subscription. You can receive unlimited vouches on any paid plan — the number shown is how many you can publish on your public profile.
        </p>

        <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <a href="/terms" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '.8rem' }}>Terms of Use</a>
          <a href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '.8rem' }}>Privacy Policy</a>
        </div>
      </div>
    </div>
  )
}
