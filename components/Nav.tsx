'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'

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
        Recomme<span>Now</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link
          href="/#how"
          style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--muted)', textDecoration: 'none' }}
        >
          How it works
        </Link>
        <Link
          href="/#proof"
          style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--muted)', textDecoration: 'none' }}
        >
          Examples
        </Link>
        <Link
          href="/pricing"
          style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--muted)', textDecoration: 'none' }}
        >
          Pricing
        </Link>

        {isSignedIn ? (
          <Link href="/dashboard" className="btn-primary" style={{ padding: '.5rem 1.1rem', fontSize: '.78rem' }}>
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/sign-in"
              style={{ fontSize: '.78rem', fontWeight: 500, color: 'var(--muted)', textDecoration: 'none' }}
            >
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
