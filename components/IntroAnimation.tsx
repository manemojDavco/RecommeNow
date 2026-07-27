'use client'

import { useEffect, useState } from 'react'

// Brand-story intro: the RecommeNow logo builds itself, then flies to the header.
//  0  right person (grey) — "Job searcher"
//  1  left person (cream) appears — "Hey — you're the best resource…"
//  2  bubbles go, the hand (arrow) connects, right person turns green,
//     the Approved check is born  → the real logo
//  3  wordmark reveals
//  4  the whole logo shrinks to the top-left corner and the page appears
//
// Plays once per browser session; skipped for reduced-motion users.

const SEEN_KEY = 'rn_intro_seen'

export default function IntroAnimation() {
  // Start shown so the very first paint is covered (no page flash); an effect
  // hides it immediately if it was already seen or motion is reduced.
  const [show, setShow] = useState(true)
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const seen = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SEEN_KEY)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (seen || reduce) { setShow(false); return }

    try { sessionStorage.setItem(SEEN_KEY, '1') } catch { /* private mode */ }

    const t = [
      setTimeout(() => setStage(1), 1100),
      setTimeout(() => setStage(2), 2400),
      setTimeout(() => setStage(3), 3500),
      setTimeout(() => setStage(4), 4300),
      setTimeout(() => setShow(false), 5200),
    ]
    return () => t.forEach(clearTimeout)
  }, [])

  if (!show) return null

  // Colours from the real mark.
  const CREAM = '#F0EAD6'
  const LIGHT = '#95D5B2'
  const DARK = '#2D6A4F'
  const GREY = '#9aa0a6'

  const rightFill = stage >= 2 ? LIGHT : GREY
  const flying = stage >= 4

  const t = (delay = 0) => ({ transition: `all .6s cubic-bezier(.22,1,.36,1) ${delay}s` })

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--paper, #f7f6f1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: flying ? 0 : 1,
        transition: 'opacity .7s ease .25s',
        pointerEvents: flying ? 'none' : 'auto',
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '1.1rem',
          transformOrigin: 'top left',
          // Fly to roughly where the header logo sits (top-left).
          transform: flying
            ? 'translate(calc(-50vw + 2.6rem), calc(-50vh + 1.9rem)) scale(.19)'
            : 'translate(0,0) scale(1)',
          ...t(),
        }}
      >
        {/* Logo mark — same geometry as components/Logo.tsx, animated in parts */}
        <svg width="150" height="150" viewBox="0 0 32 32" style={{ display: 'block', overflow: 'visible' }}>
          {/* canvas */}
          <rect width="32" height="32" rx="7" fill={DARK} />

          {/* RIGHT person (the job searcher) — visible from the start, grey → green */}
          <g style={{ opacity: 1 }}>
            <circle cx="23" cy="10" r="4" fill={rightFill} style={t()} />
            <path d="M17 26 Q17 18 23 18 Q29 18 29 26 Z" fill={rightFill} style={t()} />
          </g>

          {/* LEFT person (the reference) — appears at stage 1 */}
          <g style={{ opacity: stage >= 1 ? 1 : 0, transform: stage >= 1 ? 'none' : 'translateX(-3px)', transformOrigin: 'center', ...t() }}>
            <circle cx="9" cy="10" r="4" fill={CREAM} />
            <path d="M3 26 Q3 18 9 18 Q15 18 15 26 Z" fill={CREAM} />
          </g>

          {/* The hand (arrow) reaching across — draws at stage 2 */}
          <g style={{ opacity: stage >= 2 ? 1 : 0, ...t(.1) }}>
            <path d="M14 20 Q18 17 20 17" stroke={LIGHT} strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <polygon points="20,17 16.5,14.5 16.5,19.5" fill={LIGHT} />
          </g>

          {/* Approved check — pops in at stage 2 */}
          <g style={{ opacity: stage >= 2 ? 1 : 0, transform: stage >= 2 ? 'scale(1)' : 'scale(0)', transformOrigin: '28px 5px', transition: 'all .45s cubic-bezier(.34,1.56,.64,1) .25s' }}>
            <circle cx="28" cy="5" r="4" fill={CREAM} />
            <polyline points="25.8,5 27,6.3 30.2,3" stroke={DARK} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>

        {/* Wordmark — reveals at stage 3 */}
        <span
          style={{
            fontFamily: 'var(--sans, Manrope, sans-serif)', fontSize: '2.6rem', fontWeight: 800,
            letterSpacing: '-.02em', lineHeight: 1, whiteSpace: 'nowrap',
            opacity: stage >= 3 ? 1 : 0, transform: stage >= 3 ? 'none' : 'translateX(-8px)',
            ...t(),
          }}
        >
          <span style={{ color: 'var(--ink, #1B4332)' }}>Recomme</span>
          <span style={{ color: '#52B788' }}>Now</span>
        </span>

        {/* Speech bubbles (HTML, positioned over the mark) */}
        <Bubble side="right" show={stage === 0} text="Job searcher" />
        <Bubble side="left" show={stage === 1} text="Hey — you're the best resource for any company" />
      </div>
    </div>
  )
}

function Bubble({ side, show, text }: { side: 'left' | 'right'; show: boolean; text: string }) {
  // The mark is 150px wide starting at the container's left edge; heads sit at
  // ~28% (left) and ~72% (right) horizontally.
  const cx = side === 'left' ? 42 : 108 // px from mark's left edge
  return (
    <div
      style={{
        position: 'absolute', left: cx, top: -6, transform: `translate(-50%, -100%) scale(${show ? 1 : 0.85})`,
        transformOrigin: 'bottom center',
        opacity: show ? 1 : 0,
        transition: 'all .4s cubic-bezier(.34,1.56,.64,1)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: '#fff', color: 'var(--ink, #1B4332)',
          border: '1px solid var(--rule, #e5e3da)',
          borderRadius: 14, padding: '.55rem .8rem',
          fontFamily: 'var(--sans, Manrope, sans-serif)', fontSize: '.82rem', fontWeight: 600,
          lineHeight: 1.35, maxWidth: side === 'left' ? 230 : 150, textAlign: 'center',
          boxShadow: '0 8px 24px rgba(27,67,50,.12)',
        }}
      >
        {text}
        <span style={{
          position: 'absolute', left: '50%', bottom: -6, transform: 'translateX(-50%) rotate(45deg)',
          width: 10, height: 10, background: '#fff', borderRight: '1px solid var(--rule, #e5e3da)', borderBottom: '1px solid var(--rule, #e5e3da)',
        }} />
      </div>
    </div>
  )
}
