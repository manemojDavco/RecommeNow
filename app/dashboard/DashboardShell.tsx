'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { useState } from 'react'
import type { Profile } from '@/types'
import { isProTrial, proTrialDaysLeft } from '@/lib/plans'
import { Logo } from '@/components/Logo'

// Inline SVG icon for the Vouches nav item — two people + verified badge,
// matching the custom VouchesTabIcon from the mobile app.
function VouchesNavIcon({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) {
  const s = size / 32
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill={color} xmlns="http://www.w3.org/2000/svg">
      {/* Left person head */}
      <circle cx={9} cy={10} r={4} />
      {/* Left person body */}
      <rect x={3} y={20} width={12} height={8} rx={6} />
      {/* Arrow shaft */}
      <rect x={14} y={18} width={5} height={2} rx={1} />
      {/* Arrow head (right-pointing triangle) */}
      <polygon points="18,14 22,19 18,24" />
      {/* Right person head */}
      <circle cx={23} cy={10} r={4} />
      {/* Right person body */}
      <rect x={17} y={20} width={12} height={8} rx={6} />
      {/* Verified badge */}
      <circle cx={28} cy={4} r={4.5} fill={color} />
      {/* Badge checkmark */}
      <polyline points="26,4 27.5,5.5 30.5,2.5" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const NAV_ITEMS: { label: string; href: string; icon: React.ReactNode }[] = [
  { label: 'Overview', href: '/dashboard', icon: '⊞' },
  { label: 'Vouches', href: '/dashboard/vouches', icon: <VouchesNavIcon size={16} /> },
  { label: 'Share & Embed', href: '/dashboard/share', icon: '⤴' },
  { label: 'Approvals', href: '/dashboard/approvals', icon: '✓' },
  { label: 'Flagged', href: '/dashboard/flagged', icon: '⚑' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙' },
  {
    label: 'Billing',
    href: '/dashboard/billing',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="20" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" fill="none"/>
        <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

const RECRUITER_NAV_ITEMS: { label: string; href: string; icon: React.ReactNode }[] = [
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
        <div style={{ padding: '.85rem 1.4rem .75rem', borderBottom: '1px solid rgba(255,255,255,.07)', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
          <Logo variant="light" href="/" size={30} />
        </div>

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
              fontFamily: 'var(--sans)',
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.35rem', marginBottom: '.1rem', minWidth: 0 }}>
            <div
              style={{
                fontSize: '.95rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,.85)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {profile.name}
            </div>
            {(isPro || isRecruiter) && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="15" height="15" style={{ flexShrink: 0 }}>
                {isRecruiter ? <>
                  <circle cx="9" cy="10" r="4" fill="#5B21B6"/>
                  <path d="M3 26 Q3 18 9 18 Q15 18 15 26 Z" fill="#5B21B6"/>
                  <path d="M14 20 Q18 17 20 17" stroke="#A78BFA" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                  <polygon points="20,17 16.5,14.5 16.5,19.5" fill="#A78BFA"/>
                  <circle cx="23" cy="10" r="4" fill="#A78BFA"/>
                  <path d="M17 26 Q17 18 23 18 Q29 18 29 26 Z" fill="#A78BFA"/>
                  <circle cx="28" cy="5" r="4" fill="#5B21B6"/>
                  <polyline points="25.8,5 27,6.3 30.2,3" stroke="#fff" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </> : <>
                  <circle cx="9" cy="10" r="4" fill="#95D5B2"/>
                  <path d="M3 26 Q3 18 9 18 Q15 18 15 26 Z" fill="#95D5B2"/>
                  <path d="M14 20 Q18 17 20 17" stroke="#F0EAD6" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                  <polygon points="20,17 16.5,14.5 16.5,19.5" fill="#F0EAD6"/>
                  <circle cx="23" cy="10" r="4" fill="#F0EAD6"/>
                  <path d="M17 26 Q17 18 23 18 Q29 18 29 26 Z" fill="#F0EAD6"/>
                  <circle cx="28" cy="5" r="4" fill="#95D5B2"/>
                  <polyline points="25.8,5 27,6.3 30.2,3" stroke="#2D6A4F" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </>}
              </svg>
            )}
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
                  {portalLoading ? '…' : (
                    <>
                      {/* SVG icons — rendered as white glyphs matching the sidebar */}
                      {isRecruiter && isPro ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                          {' '}Recruiter{' '}+{' '}
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          {' '}Pro · Manage
                        </>
                      ) : isRecruiter ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                          {' '}Recruiter · Manage
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          {' '}Pro · Manage
                        </>
                      )}
                    </>
                  )}
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
          {(isPro || isRecruiter) && (
            <Link
              href={`/${profile.slug}/print`}
              target="_blank"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '.5rem',
                fontSize: '.78rem',
                fontWeight: 500,
                color: 'rgba(255,255,255,.4)',
                textDecoration: 'none',
                padding: '.25rem .5rem',
                borderRadius: 6,
                transition: 'color .15s',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print to PDF
            </Link>
          )}
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
