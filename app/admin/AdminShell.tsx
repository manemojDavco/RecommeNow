'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin/content',    label: 'Content',    icon: '✏️' },
  { href: '/admin/operations', label: 'Operations', icon: '⚙️' },
  { href: '/admin/settings',   label: 'Settings',   icon: '🔧' },
  { href: '/admin/analytics',  label: 'Analytics',  icon: '📊' },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* Sidebar */}
      <aside style={{ width: 230, background: '#1B4332', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }}>

        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(149,213,178,.1)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28">
              <rect width="32" height="32" rx="7" fill="#2D6A4F"/>
              <circle cx="9" cy="10" r="4" fill="#F0EAD6"/>
              <path d="M3 26 Q3 18 9 18 Q15 18 15 26 Z" fill="#F0EAD6"/>
              <path d="M14 20 Q18 17 20 17" stroke="#95D5B2" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
              <polygon points="20,17 16.5,14.5 16.5,19.5" fill="#95D5B2"/>
              <circle cx="23" cy="10" r="4" fill="#95D5B2"/>
              <path d="M17 26 Q17 18 23 18 Q29 18 29 26 Z" fill="#95D5B2"/>
              <circle cx="28" cy="5" r="4" fill="#F0EAD6"/>
              <polyline points="25.8,5 27,6.3 30.2,3" stroke="#2D6A4F" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#F0EAD6', letterSpacing: '-0.01em' }}>
              Recomme<span style={{ color: '#52B788' }}>Now</span>
            </span>
          </Link>
          <div style={{ marginTop: 6, fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(149,213,178,.5)' }}>Admin Panel</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ href, label, icon }) => {
            const active = path.startsWith(href)
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
                background: active ? 'rgba(82,183,136,.15)' : 'transparent',
                color: active ? '#95D5B2' : 'rgba(240,234,214,.55)',
                fontSize: '0.85rem', fontWeight: active ? 600 : 400,
                transition: 'background .15s, color .15s',
              }}>
                <span style={{ fontSize: '1rem' }}>{icon}</span>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer links */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(149,213,178,.1)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/dashboard" style={{ fontSize: '0.75rem', color: 'rgba(149,213,178,.45)', textDecoration: 'none', fontWeight: 500 }}>← Dashboard</Link>
          <Link href="/" target="_blank" style={{ fontSize: '0.75rem', color: 'rgba(149,213,178,.45)', textDecoration: 'none', fontWeight: 500 }}>View site ↗</Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 230, flex: 1, background: '#FAFAF7', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
