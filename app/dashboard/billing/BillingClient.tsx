'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

function PlanBadge({ variant, size = 22 }: { variant: 'pro' | 'recruiter'; size?: number }) {
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

interface Subscription {
  id: string
  status: string
  currentPeriodEnd: number
  amount: number | null
  currency: string | null
  interval: string | null
  cancelAtPeriodEnd: boolean
}

interface Invoice {
  id: string
  date: number
  amount: number
  currency: string
  status: string | null
  pdfUrl: string | null
  hostedUrl: string | null
}

interface PaymentMethod {
  brand: string
  last4: string
  expMonth: number
  expYear: number
}

interface BillingData {
  plan: 'free' | 'pro' | 'recruiter'
  subscription: Subscription | null
  invoices: Invoice[]
  paymentMethod: PaymentMethod | null
  updatePaymentUrl: string | null
}

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100)
}

function planLabel(plan: string) {
  if (plan === 'recruiter') return 'Recruiter'
  if (plan === 'pro') return 'Pro'
  return 'Free'
}

function statusColor(status: string) {
  if (status === 'active') return 'var(--green)'
  if (status === 'canceled' || status === 'incomplete_expired') return 'var(--red)'
  return 'var(--amber)'
}

export default function BillingClient() {
  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelDone, setCancelDone] = useState(false)
  const [cancelError, setCancelError] = useState('')

  useEffect(() => {
    fetch('/api/stripe/billing')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setData(d)
      })
      .catch(() => setError('Failed to load billing information.'))
      .finally(() => setLoading(false))
  }, [])

  async function cancelSubscription() {
    if (!confirm('Cancel your subscription? You keep access until the end of the billing period.')) return
    setCancelling(true)
    setCancelError('')
    try {
      const res = await fetch('/api/stripe/billing', { method: 'DELETE' })
      const d = await res.json()
      if (res.ok) {
        setCancelDone(true)
        // Refresh billing data
        const refreshed = await fetch('/api/stripe/billing').then((r) => r.json())
        if (!refreshed.error) setData(refreshed)
      } else {
        setCancelError(d.error ?? 'Could not cancel. Please try again.')
      }
    } catch {
      setCancelError('Network error. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem 2.5rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted)', fontFamily: 'var(--sans)', fontSize: '.9rem' }}>Loading billing information…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem 2.5rem', flex: 1 }}>
        <Link href="/dashboard/settings" style={{ fontSize: '.82rem', color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '.3rem', marginBottom: '1.5rem' }}>
          ← Back to Settings
        </Link>
        <p style={{ color: 'var(--red)', background: 'var(--red-l)', padding: '.7rem 1rem', borderRadius: 8, fontSize: '.85rem', fontFamily: 'var(--sans)' }}>{error}</p>
      </div>
    )
  }

  if (!data) return null

  const { plan, subscription, invoices, paymentMethod, updatePaymentUrl } = data

  return (
    <div style={{ padding: '2rem 2.5rem', flex: 1 }}>
      {/* Back link */}
      <Link
        href="/dashboard/settings"
        style={{ fontSize: '.82rem', color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '.3rem', marginBottom: '1.5rem' }}
      >
        ← Back to Settings
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--sans)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.25rem' }}>Billing &amp; Subscription</h1>
        <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>Manage your subscription and payment details.</p>
      </div>

      <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Plan card */}
        <div style={{ border: '1.5px solid var(--rule)', borderRadius: 12, padding: '1.25rem 1.4rem', background: 'var(--paper)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.3rem' }}>
                <p style={{ fontFamily: 'var(--sans)', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>
                  {planLabel(plan)} plan
                </p>
                {plan !== 'free' && <PlanBadge variant={plan} />}
                {subscription && (
                  <span style={{
                    fontSize: '.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                    background: subscription.status === 'active' ? 'var(--green-l)' : 'var(--red-l)',
                    color: statusColor(subscription.status),
                    border: `1px solid ${subscription.status === 'active' ? 'var(--green-m)' : 'var(--red)'}`,
                    textTransform: 'uppercase' as const, letterSpacing: '.05em',
                  }}>
                    {subscription.cancelAtPeriodEnd ? 'Cancels at period end' : subscription.status}
                  </span>
                )}
              </div>

              {subscription && subscription.amount != null && subscription.currency && subscription.interval && (
                <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '.2rem' }}>
                  {formatAmount(subscription.amount, subscription.currency)} / {subscription.interval}
                </p>
              )}
              {subscription && (
                <p style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
                  {subscription.cancelAtPeriodEnd ? 'Access until' : 'Next billing date'}:{' '}
                  <strong style={{ color: 'var(--ink)' }}>{formatDate(subscription.currentPeriodEnd)}</strong>
                </p>
              )}

              {!subscription && plan === 'free' && (
                <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginTop: '.3rem' }}>
                  You are on the Free plan.{' '}
                  <Link href="/pricing" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Upgrade →</Link>
                </p>
              )}
              {!subscription && plan !== 'free' && (
                <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginTop: '.3rem' }}>
                  Active {planLabel(plan)} plan. Billing details will appear here once a payment has been processed.
                </p>
              )}
            </div>

            {/* Cancel button */}
            {subscription && !subscription.cancelAtPeriodEnd && (
              <button
                onClick={cancelSubscription}
                disabled={cancelling}
                style={{
                  padding: '.45rem .9rem', borderRadius: 7, border: '1.5px solid var(--red)',
                  background: 'var(--red-l)', color: 'var(--red)', fontSize: '.75rem', fontWeight: 600,
                  cursor: cancelling ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)',
                  opacity: cancelling ? 0.6 : 1, whiteSpace: 'nowrap' as const,
                }}
              >
                {cancelling ? 'Cancelling…' : 'Cancel subscription'}
              </button>
            )}
          </div>

          {/* Cancel note */}
          {subscription && !subscription.cancelAtPeriodEnd && (
            <p style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '.75rem', borderTop: '1px solid var(--rule)', paddingTop: '.6rem' }}>
              Cancels at end of billing period. You keep full access until then.
            </p>
          )}

          {/* Feedback messages */}
          {cancelDone && (
            <p style={{ fontSize: '.78rem', color: 'var(--green2)', background: 'var(--green-l)', padding: '.5rem .8rem', borderRadius: 7, marginTop: '.75rem' }}>
              Your subscription is set to cancel at the end of the billing period.
            </p>
          )}
          {cancelError && (
            <p style={{ fontSize: '.75rem', color: 'var(--red)', background: 'var(--red-l)', padding: '.5rem .8rem', borderRadius: 7, marginTop: '.6rem' }}>{cancelError}</p>
          )}
        </div>

        {/* Payment method card */}
        {(paymentMethod || updatePaymentUrl) && (
          <div style={{ border: '1.5px solid var(--rule)', borderRadius: 12, padding: '1.25rem 1.4rem' }}>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '.88rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.75rem' }}>Payment method</p>
            {paymentMethod ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                  <span style={{ fontSize: '.82rem', color: 'var(--ink)', fontWeight: 600, textTransform: 'capitalize' as const }}>
                    {paymentMethod.brand}
                  </span>
                  <span style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
                    •••• {paymentMethod.last4}
                  </span>
                  <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>
                    Expires {paymentMethod.expMonth.toString().padStart(2, '0')}/{paymentMethod.expYear}
                  </span>
                </div>
                {updatePaymentUrl && (
                  <a
                    href={updatePaymentUrl}
                    style={{
                      padding: '.45rem .9rem', borderRadius: 7, border: '1.5px solid var(--rule)',
                      background: '#fff', color: 'var(--ink)', fontSize: '.75rem', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'var(--sans)', textDecoration: 'none', whiteSpace: 'nowrap' as const,
                    }}
                  >
                    Update card
                  </a>
                )}
              </div>
            ) : updatePaymentUrl ? (
              <a
                href={updatePaymentUrl}
                style={{
                  display: 'inline-block', padding: '.5rem 1rem', borderRadius: 7,
                  border: '1.5px solid var(--rule)', background: '#fff', color: 'var(--ink)',
                  fontSize: '.78rem', fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--sans)',
                }}
              >
                Update payment method
              </a>
            ) : null}
          </div>
        )}

        {/* Invoices table */}
        {invoices.length > 0 && (
          <div style={{ border: '1.5px solid var(--rule)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid var(--rule)', background: 'var(--paper)' }}>
              <p style={{ fontFamily: 'var(--sans)', fontSize: '.88rem', fontWeight: 700, color: 'var(--ink)' }}>Invoices</p>
            </div>
            <div style={{ overflowX: 'auto' as const }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: '.8rem', fontFamily: 'var(--sans)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--rule)', background: 'var(--paper)' }}>
                    <th style={{ padding: '.6rem 1.4rem', textAlign: 'left' as const, color: 'var(--muted)', fontWeight: 600, fontSize: '.72rem', letterSpacing: '.05em', textTransform: 'uppercase' as const }}>Date</th>
                    <th style={{ padding: '.6rem 1rem', textAlign: 'left' as const, color: 'var(--muted)', fontWeight: 600, fontSize: '.72rem', letterSpacing: '.05em', textTransform: 'uppercase' as const }}>Amount</th>
                    <th style={{ padding: '.6rem 1rem', textAlign: 'left' as const, color: 'var(--muted)', fontWeight: 600, fontSize: '.72rem', letterSpacing: '.05em', textTransform: 'uppercase' as const }}>Status</th>
                    <th style={{ padding: '.6rem 1.4rem', textAlign: 'right' as const, color: 'var(--muted)', fontWeight: 600, fontSize: '.72rem', letterSpacing: '.05em', textTransform: 'uppercase' as const }}>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--rule)' }}>
                      <td style={{ padding: '.75rem 1.4rem', color: 'var(--ink)' }}>{formatDate(inv.date)}</td>
                      <td style={{ padding: '.75rem 1rem', color: 'var(--ink)', fontWeight: 600 }}>
                        {formatAmount(inv.amount, inv.currency)}
                      </td>
                      <td style={{ padding: '.75rem 1rem' }}>
                        <span style={{
                          fontSize: '.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: 100,
                          background: inv.status === 'paid' ? 'var(--green-l)' : 'var(--amber-l)',
                          color: inv.status === 'paid' ? 'var(--green)' : 'var(--amber)',
                          border: `1px solid ${inv.status === 'paid' ? 'var(--green-m)' : 'var(--amber)'}`,
                          textTransform: 'uppercase' as const, letterSpacing: '.04em',
                        }}>
                          {inv.status ?? 'unknown'}
                        </span>
                      </td>
                      <td style={{ padding: '.75rem 1.4rem', textAlign: 'right' as const }}>
                        {inv.pdfUrl ? (
                          <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer"
                            style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none', fontSize: '.78rem' }}>
                            Download
                          </a>
                        ) : inv.hostedUrl ? (
                          <a href={inv.hostedUrl} target="_blank" rel="noopener noreferrer"
                            style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none', fontSize: '.78rem' }}>
                            View
                          </a>
                        ) : (
                          <span style={{ color: 'var(--muted)', fontSize: '.75rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {invoices.length === 0 && subscription && (
          <p style={{ fontSize: '.8rem', color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>No invoices yet.</p>
        )}

      </div>
    </div>
  )
}
