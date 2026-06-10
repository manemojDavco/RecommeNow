'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'

export default function VerifyDevicePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { signOut } = useClerk()
  const token = searchParams.get('token')
  const next = searchParams.get('next') ?? '/dashboard'
  const [status, setStatus] = useState<'pending' | 'approved' | 'denied' | 'expired' | 'error'>('pending')

  useEffect(() => {
    if (!token) { setStatus('error'); return }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/device-approval/${token}/status`)
        const data = await res.json()
        if (data.status === 'approved') {
          clearInterval(interval)
          setStatus('approved')
          setTimeout(() => router.replace(next), 800)
        } else if (data.status === 'denied') {
          clearInterval(interval)
          setStatus('denied')
          await signOut()
        } else if (data.status === 'expired') {
          clearInterval(interval)
          setStatus('expired')
          await signOut()
        }
      } catch {
        // keep polling
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [token, next, router, signOut])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f9fafb', fontFamily: '-apple-system, Helvetica, Arial, sans-serif',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '48px 40px', maxWidth: 440, width: '100%',
        border: '1px solid #e5e7eb', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
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
        </div>

        {status === 'pending' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 20 }}>📱</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a4231', marginBottom: 12 }}>
              Check your RecommeNow app
            </h1>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6, marginBottom: 28 }}>
              We sent a notification to your phone. Open the RecommeNow app and tap <strong>Yes, it's me</strong> to confirm your sign-in.
            </p>
            <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'left', background: '#f9fafb', borderRadius: 10, padding: '16px 20px', marginBottom: 28 }}>
              <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#6b7280' }}>Didn't receive a notification?</p>
              <ol style={{ paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
                <li>Open the RecommeNow app on your phone</li>
                <li>Come back here — it will update automatically</li>
              </ol>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#9ca3af', fontSize: 13 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
              </svg>
              Waiting for approval…
            </div>
          </>
        )}

        {status === 'approved' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a4231', marginBottom: 8 }}>Approved!</h1>
            <p style={{ fontSize: 15, color: '#6b7280' }}>Taking you in…</p>
          </>
        )}

        {status === 'denied' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>Sign-in denied</h1>
            <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 24 }}>
              The sign-in was declined from your phone. You've been signed out for security.
            </p>
            <a href="/sign-in" style={{ display: 'inline-block', background: '#1a4231', color: '#fff', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              Back to sign in
            </a>
          </>
        )}

        {status === 'expired' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏱</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#d97706', marginBottom: 8 }}>Request expired</h1>
            <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 24 }}>
              The verification request timed out. Please sign in again.
            </p>
            <a href="/sign-in" style={{ display: 'inline-block', background: '#1a4231', color: '#fff', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              Sign in again
            </a>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>Something went wrong</h1>
            <a href="/sign-in" style={{ display: 'inline-block', background: '#1a4231', color: '#fff', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              Back to sign in
            </a>
          </>
        )}
      </div>
    </div>
  )
}
