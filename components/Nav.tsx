'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size} className="rn-logo-mark">
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
  )
}

export default function Nav() {
  const { isSignedIn } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  function closeMenu() { setMenuOpen(false) }

  return (
    <>
      <nav className={`rn-nav${scrolled ? ' scrolled' : ''}`}>
        {/* Left: logo + desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <Link href="/" className="rn-logo" onClick={closeMenu}>
            <LogoMark size={30} />
            <span className="rn-logo-text">Recomme<span>Now</span></span>
          </Link>

          <div className="rn-desktop-only" style={{ alignItems: 'center', gap: '1.75rem' }}>
            <Link href="/#how" style={navLinkStyle}>How it works</Link>
            <Link href="/#proof" style={navLinkStyle}>Examples</Link>
            <Link href="/pricing" style={navLinkStyle}>Pricing</Link>
            <Link href="/faq" style={navLinkStyle}>FAQ</Link>
          </div>
        </div>

        {/* Right: auth actions (desktop) + hamburger (mobile) */}
        <div className="rn-desktop-only" style={{ alignItems: 'center', gap: '1rem' }}>
          {isSignedIn ? (
            <Link href="/dashboard" className="btn-primary" style={{ padding: '.5rem 1.1rem', fontSize: '.78rem' }}>Dashboard</Link>
          ) : (
            <>
              <Link href="/sign-in" style={navLinkStyle}>Sign in</Link>
              <Link href="/sign-up" className="btn-primary" style={{ padding: '.5rem 1.1rem', fontSize: '.78rem' }}>Get started free</Link>
            </>
          )}
        </div>

        <button
          className="rn-mobile-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '.4rem', borderRadius: 6, color: 'var(--ink)',
            display: 'none',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {menuOpen
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="rn-mobile-menu rn-mobile-only" onClick={(e) => { if (e.target === e.currentTarget) closeMenu() }}>
          <Link href="/#how" onClick={closeMenu}>How it works</Link>
          <Link href="/#proof" onClick={closeMenu}>Examples</Link>
          <Link href="/pricing" onClick={closeMenu}>Pricing</Link>
          <Link href="/faq" onClick={closeMenu}>FAQ</Link>
          <hr style={{ border: 'none', borderTop: '1px solid var(--rule)', margin: '.5rem 0' }} />
          {isSignedIn ? (
            <Link href="/dashboard" className="btn-primary" onClick={closeMenu}>Dashboard</Link>
          ) : (
            <>
              <Link href="/sign-in" onClick={closeMenu}>Sign in</Link>
              <Link href="/sign-up" className="btn-primary" onClick={closeMenu}>Get started free</Link>
            </>
          )}
        </div>
      )}
    </>
  )
}

const navLinkStyle: React.CSSProperties = {
  fontSize: '.78rem',
  fontWeight: 500,
  color: 'var(--muted)',
  textDecoration: 'none',
}
