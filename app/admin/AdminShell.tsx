'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/Logo'

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
          <Logo variant="light" href="/" size={30} />
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
