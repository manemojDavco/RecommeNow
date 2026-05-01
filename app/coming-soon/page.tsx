'use client'

import { useState } from 'react'

function LogoMark({ size = 64 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size}>
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

export default function ComingSoonPage() {
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res  = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const data = await res.json()
      if (!res.ok) { setStatus('error'); setMessage(data.error || 'Something went wrong'); return }
      setStatus('done')
      setMessage(data.alreadyRegistered ? "You're already on the list — we'll be in touch!" : "You're on the list! We'll reach out when we launch.")
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1B4332', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>

      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, #95D5B2 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-120px', right: '-80px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, #2D6A4F 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '-80px', left: '-60px', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, #2D6A4F 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '620px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>

        {/* Logo */}
        <div style={{ marginBottom: '2rem' }}>
          <LogoMark size={72} />
        </div>

        {/* Wordmark */}
        <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', color: '#F0EAD6', marginBottom: '2.5rem' }}>
          Recomme<span style={{ color: '#52B788' }}>Now</span>
        </div>

        {/* Launching Soon badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(45,106,79,.5)', border: '1px solid rgba(149,213,178,.25)', borderRadius: '100px', padding: '6px 18px', marginBottom: '2rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#52B788', display: 'inline-block', boxShadow: '0 0 8px #52B788' }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#95D5B2' }}>Launching Soon</span>
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontWeight: 800, fontSize: 'clamp(2.6rem, 7vw, 4.2rem)', lineHeight: 1.08, letterSpacing: '-0.03em', color: '#F0EAD6', marginBottom: '1.2rem' }}>
          Don't just apply.<br />
          <span style={{ color: '#52B788' }}>Get vouched.</span>
        </h1>

        {/* Sub */}
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.05rem', fontWeight: 400, color: '#95D5B2', lineHeight: 1.65, marginBottom: '3rem', maxWidth: '480px' }}>
          Verified peer endorsements from real colleagues, managers and clients. Shared anywhere you apply.
          <br /><span style={{ color: '#52B788', fontWeight: 600 }}>The vouch that opens the door.</span>
        </p>

        {/* Email form */}
        {status === 'done' ? (
          <div style={{ background: 'rgba(82,183,136,.12)', border: '1px solid rgba(82,183,136,.3)', borderRadius: '14px', padding: '20px 32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="11" fill="#52B788"/><polyline points="6,11 9.5,14.5 16,7.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.95rem', fontWeight: 500, color: '#95D5B2' }}>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              style={{ flex: '1 1 260px', maxWidth: '340px', padding: '14px 18px', borderRadius: '10px', border: '1.5px solid rgba(149,213,178,.25)', background: 'rgba(255,255,255,.06)', color: '#F0EAD6', fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', outline: 'none', backdropFilter: 'blur(8px)' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(82,183,136,.6)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(149,213,178,.25)' }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{ padding: '14px 26px', borderRadius: '10px', border: 'none', background: '#2D6A4F', color: '#F0EAD6', fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', fontWeight: 700, cursor: status === 'loading' ? 'not-allowed' : 'pointer', opacity: status === 'loading' ? 0.7 : 1, transition: 'background .2s, transform .1s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { if (status !== 'loading') e.currentTarget.style.background = '#52B788' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#2D6A4F' }}
            >
              {status === 'loading' ? 'Joining…' : 'Join the waitlist'}
            </button>
            {status === 'error' && (
              <p style={{ width: '100%', textAlign: 'center', fontSize: '0.82rem', color: '#ff8080', marginTop: '4px' }}>{message}</p>
            )}
          </form>
        )}

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: 'rgba(149,213,178,.5)', marginTop: '1rem' }}>
          No spam. We'll only reach out when we launch.
        </p>

        {/* Social links */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '3rem', alignItems: 'center' }}>
          <a href="https://www.linkedin.com/company/recommenow" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '7px', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 600, color: 'rgba(149,213,178,.6)', textDecoration: 'none', transition: 'color .2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#95D5B2'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(149,213,178,.6)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            Follow on LinkedIn
          </a>
        </div>

      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: '1.5rem', fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'rgba(149,213,178,.3)' }}>
        © 2026 RecommeNow
      </div>

    </div>
  )
}
