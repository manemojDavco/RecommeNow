'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import type { Profile } from '@/types'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: '⊞' },
  { label: 'Vouches', href: '/dashboard/vouches', icon: '❝' },
  { label: 'Share & Embed', href: '/dashboard/share', icon: '⤴' },
  { label: 'Approvals', href: '/dashboard/approvals', icon: '✓' },
  { label: 'Flagged', href: '/dashboard/flagged', icon: '⚑' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙' },
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
        <div
          style={{
            padding: '1.4rem 1.4rem 1rem',
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: '1rem',
            color: 'rgba(255,255,255,.5)',
            borderBottom: '1px solid rgba(255,255,255,.07)',
            flexShrink: 0,
          }}
        >
          Recomme<span style={{ color: 'rgba(255,255,255,.9)' }}>Now</span>
        </div>

        {/* User info */}
        <div
          style={{
            padding: '1.2rem',
            borderBottom: '1px solid rgba(255,255,255,.07)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.12)',
              border: '1.5px solid rgba(255,255,255,.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: '.85rem',
              color: 'rgba(255,255,255,.85)',
              marginBottom: '.6rem',
            }}
          >
            {initials}
          </div>
          <div
            style={{
              fontSize: '.82rem',
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
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '.3rem',
              background: 'rgba(255,255,255,.08)',
              border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 100,
              padding: '.18rem .6rem',
              fontSize: '.6rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,.5)',
              cursor: 'pointer',
            }}
          >
            Free plan
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '.8rem 0', overflowY: 'auto' }}>
          <p
            style={{
              fontSize: '.55rem',
              fontWeight: 700,
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,.22)',
              padding: '.8rem 1.2rem .3rem',
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
                  gap: '.65rem',
                  padding: '.6rem 1.2rem',
                  fontSize: '.78rem',
                  fontWeight: active ? 600 : 500,
                  color: active ? '#fff' : 'rgba(255,255,255,.5)',
                  textDecoration: 'none',
                  background: active ? 'rgba(255,255,255,.1)' : 'transparent',
                  borderLeft: active ? '2px solid rgba(255,255,255,.4)' : '2px solid transparent',
                  transition: 'all .15s',
                }}
              >
                <span style={{ fontSize: '.85rem', opacity: active ? 1 : 0.6 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: view profile + sign out */}
        <div
          style={{
            padding: '1rem 1.2rem',
            borderTop: '1px solid rgba(255,255,255,.07)',
            display: 'flex',
            flexDirection: 'column',
            gap: '.5rem',
            flexShrink: 0,
          }}
        >
          <Link
            href={`/${profile.slug}`}
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '.5rem',
              fontSize: '.75rem',
              fontWeight: 500,
              color: 'rgba(255,255,255,.5)',
              textDecoration: 'none',
              padding: '.4rem .6rem',
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
              gap: '.5rem',
              fontSize: '.75rem',
              fontWeight: 500,
              color: 'rgba(255,255,255,.35)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '.4rem .6rem',
              borderRadius: 6,
              fontFamily: 'var(--sans)',
              textAlign: 'left',
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
          background: 'var(--paper)',
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
