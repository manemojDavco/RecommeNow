'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { useState } from 'react'
import type { Profile } from '@/types'
import { isProTrial, proTrialDaysLeft } from '@/lib/plans'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: '⊞' },
  { label: 'Vouches', href: '/dashboard/vouches', icon: '❝' },
  { label: 'Share & Embed', href: '/dashboard/share', icon: '⤴' },
  { label: 'Approvals', href: '/dashboard/approvals', icon: '✓' },
  { label: 'Flagged', href: '/dashboard/flagged', icon: '⚑' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙' },
]

const RECRUITER_NAV_ITEMS = [
  { label: 'Talent Directory', href: '/directory', icon: '⊛' },
]

export default function DashboardShell({
  children,
  profile,
}: {
  children: React.ReactNode
  profile: Profile
}) {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState('')

  async function openPortal() {
    setPortalLoading(true)
    setPortalError('')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setPortalError(data.error ?? 'Could not open billing portal.')
      }
    } catch {
      setPortalError('Network error. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  const isPro = profile.plan === 'pro'
  const isTrial = isProTrial(profile)
  const trialDaysLeft = proTrialDaysLeft(profile.pro_trial_until)
  const isRecruiter = profile.recruiter_active

  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* ── SIDEBAR ── */}
      <aside
        style={{
          background: 'var(--green)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <Link
          href="/"
          style={{
            padding: '.9rem 1.4rem .7rem',
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: '1.15rem',
            color: 'rgba(255,255,255,.5)',
            borderBottom: '1px solid rgba(255,255,255,.07)',
            flexShrink: 0,
            textDecoration: 'none',
            display: 'block',
            textAlign: 'center',
          }}
        >
          Recomme<span style={{ color: 'rgba(255,255,255,.9)' }}>Now</span>
        </Link>

        {/* User info */}
        <div
          style={{
            padding: '.75rem 1rem',
            borderBottom: '1px solid rgba(255,255,255,.07)',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.12)',
              border: '1.5px solid rgba(255,255,255,.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'rgba(255,255,255,.85)',
              marginBottom: '.4rem',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {profile.photo_url
              ? <img src={profile.photo_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : initials}
          </div>
          <div
            style={{
              fontSize: '.95rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,.85)',
              marginBottom: '.1rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {profile.name}
          </div>
          {(isPro || isRecruiter) ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.25rem' }}>
              {/* Trial users: show days-remaining badge + upgrade CTA */}
              {isTrial && (
                <Link
                  href="/pricing"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '.3rem',
                    background: 'rgba(255,215,0,.15)',
                    border: '1px solid rgba(255,215,0,.35)',
                    borderRadius: 100,
                    padding: '.18rem .6rem',
                    fontSize: '.68rem',
                    fontWeight: 700,
                    color: '#ffd700',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ✨ PRO Trial · {trialDaysLeft}d left
                </Link>
              )}
              {/* Paid pro/recruiter: show manage button */}
              {!isTrial && (
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '.3rem',
                    background: 'rgba(255,255,255,.15)',
                    border: '1px solid rgba(255,255,255,.25)',
                    borderRadius: 100,
                    padding: '.18rem .6rem',
                    fontSize: '.72rem',
                    fontWeight: 700,
                    color: '#fff',
                    cursor: portalLoading ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--sans)',
                  }}
                >
                  {portalLoading ? '…' : isRecruiter && isPro ? '🔍 Recruiter + ★ Pro · Manage' : isRecruiter ? '🔍 Recruiter · Manage' : '★ Pro · Manage'}
                </button>
              )}
              {portalError && (
                <p style={{ fontSize: '.72rem', color: 'rgba(255,100,100,.9)', marginTop: '.25rem', lineHeight: 1.3 }}>{portalError}</p>
              )}
            </div>
          ) : (
            <Link
              href="/pricing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '.3rem',
                background: 'rgba(255,255,255,.08)',
                border: '1px solid rgba(255,255,255,.12)',
                borderRadius: 100,
                padding: '.18rem .6rem',
                fontSize: '.72rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,.5)',
                textDecoration: 'none',
              }}
            >
              Free · Upgrade ↑
            </Link>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '.4rem 0', overflowY: 'auto' }}>
          <p
            style={{
              fontSize: '.65rem',
              fontWeight: 700,
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,.22)',
              padding: '.5rem 1.2rem .2rem',
              textAlign: 'center',
            }}
          >
            Manage
          </p>
          {NAV_ITEMS.map((item) => {
            const active = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '.65rem',
                  padding: '.45rem 1rem',
                  fontSize: '.9rem',
                  fontWeight: active ? 600 : 500,
                  color: active ? '#fff' : 'rgba(255,255,255,.5)',
                  textDecoration: 'none',
                  background: active ? 'rgba(255,255,255,.1)' : 'transparent',
                  borderRadius: 7,
                  margin: '0 .5rem',
                  transition: 'all .15s',
                }}
              >
                <span style={{ fontSize: '1rem', opacity: active ? 1 : 0.6 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}

          {/* Recruiter-only section */}
          {isRecruiter && (
            <>
              <p
                style={{
                  fontSize: '.65rem',
                  fontWeight: 700,
                  letterSpacing: '.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,.22)',
                  padding: '.5rem 1.2rem .2rem',
                  marginTop: '.2rem',
                  textAlign: 'center',
                }}
              >
                Recruit
              </p>
              {RECRUITER_NAV_ITEMS.map((item) => {
                const active = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '.65rem',
                      padding: '.6rem 1rem',
                      fontSize: '.78rem',
                      fontWeight: active ? 600 : 500,
                      color: active ? '#fff' : 'rgba(255,255,255,.5)',
                      textDecoration: 'none',
                      background: active ? 'rgba(255,255,255,.1)' : 'transparent',
                      borderRadius: 7,
                      margin: '0 .5rem',
                      transition: 'all .15s',
                    }}
                  >
                    <span style={{ fontSize: '.85rem', opacity: active ? 1 : 0.6 }}>{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        {/* Trial CTA — for first-100 users on free PRO trial */}
        {isTrial && (
          <div style={{ padding: '.5rem .8rem', flexShrink: 0 }}>
            <Link
              href="/pricing"
              style={{
                display: 'block',
                background: 'rgba(255,215,0,.1)',
                border: '1px solid rgba(255,215,0,.25)',
                borderRadius: 10,
                padding: '.6rem',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '.82rem', fontWeight: 700, color: '#ffd700', marginBottom: '.2rem' }}>✨ {trialDaysLeft} days left in trial</p>
              <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.5 }}>Lock in PRO before it ends</p>
              <p style={{ fontSize: '.78rem', fontWeight: 600, color: 'rgba(255,215,0,.7)', marginTop: '.4rem' }}>Upgrade now →</p>
            </Link>
          </div>
        )}

        {/* Upgrade CTA — only for free users who are not recruiters */}
        {!isPro && !isRecruiter && (
          <div style={{ padding: '.5rem .8rem', flexShrink: 0 }}>
            <Link
              href="/pricing"
              style={{
                display: 'block',
                background: 'rgba(255,255,255,.1)',
                border: '1px solid rgba(255,255,255,.15)',
                borderRadius: 10,
                padding: '.6rem',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '.82rem', fontWeight: 700, color: '#fff', marginBottom: '.2rem' }}>Upgrade to Pro</p>
              <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.5 }}>Custom slug<br />Unlimited vouches</p>
              <p style={{ fontSize: '.78rem', fontWeight: 600, color: 'rgba(255,255,255,.7)', marginTop: '.4rem' }}>From $6.99/mo →</p>
            </Link>
          </div>
        )}

        {/* Bottom: view profile + sign out */}
        <div
          style={{
            padding: '.5rem 1rem',
            borderTop: '1px solid rgba(255,255,255,.07)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '.2rem',
            flexShrink: 0,
          }}
        >
          <Link
            href={`/${profile.slug}`}
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '.5rem',
              fontSize: '.88rem',
              fontWeight: 500,
              color: 'rgba(255,255,255,.5)',
              textDecoration: 'none',
              padding: '.25rem .5rem',
              borderRadius: 6,
              transition: 'color .15s',
            }}
          >
            ↗ View public profile
          </Link>
          <button
            onClick={() => signOut({ redirectUrl: '/' })}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '.5rem',
              fontSize: '.88rem',
              fontWeight: 500,
              color: 'rgba(255,255,255,.35)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '.4rem .6rem',
              borderRadius: 6,
              fontFamily: 'var(--sans)',
              transition: 'color .15s',
            }}
          >
            ⏏ Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main
        style={{
          background: '#fff',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </main>
    </div>
  )
}
