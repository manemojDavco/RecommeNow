'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'

function LogoMark({ size = 28 }: { size?: number }) {
  const s = size
  const scale = s / 32
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={s} height={s} className="rn-logo-mark">
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`rn-nav${scrolled ? ' scrolled' : ''}`}>
      <Link href="/" className="rn-logo">
        <LogoMark size={30} />
        <span className="rn-logo-text">Recomme<span>Now</span></span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link href="/#how" style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--muted)', textDecoration: 'none' }}>
          How it works
        </Link>
        <Link href="/#proof" style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--muted)', textDecoration: 'none' }}>
          Examples
        </Link>
        <Link href="/directory" style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--muted)', textDecoration: 'none' }}>
          Directory
        </Link>
        <Link href="/pricing" style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--muted)', textDecoration: 'none' }}>
          Pricing
        </Link>

        {isSignedIn ? (
          <Link href="/dashboard" className="btn-primary" style={{ padding: '.5rem 1.1rem', fontSize: '.78rem' }}>
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/sign-in" style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--muted)', textDecoration: 'none' }}>
              Sign in
            </Link>
            <Link href="/sign-up" className="btn-primary" style={{ padding: '.5rem 1.1rem', fontSize: '.78rem' }}>
              Get started free
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
