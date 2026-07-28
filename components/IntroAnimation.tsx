'use client'

import { useEffect, useRef, useState } from 'react'

// Brand-story intro: the RecommeNow logo builds itself, then flies to the header.
//  0  right person (grey) — "Job searcher"        (held longest)
//  1  left person (cream) appears — "Hey, you are the best resource that I know…"
//  2  bubbles go, the hand (arrow) connects, right person turns green,
//     the Approved check is born  → the real logo
//  3  wordmark reveals
//  4  the whole logo shrinks to the top-left corner and the page appears
//
// The scene keeps its exact composition on every screen — it's uniformly scaled
// to fit the viewport, so mobile looks like desktop, just smaller.
// Plays on every visit; skipped for reduced-motion users.

export default function IntroAnimation() {
  const [show, setShow] = useState(true)
  const [stage, setStage] = useState(0)
  const [fit, setFit] = useState(1)
  const sceneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setShow(false); return }

    // Scale the scene down so its natural size fits the viewport (with margins
    // for the speech bubbles above it).
    const measure = () => {
      const el = sceneRef.current
      if (!el) return
      const w = el.offsetWidth || 1
      const h = el.offsetHeight || 1
      const fw = (window.innerWidth * 0.92) / w
      const fh = (window.innerHeight * 0.62) / h
      setFit(Math.min(1, fw, fh))
    }
    measure()
    window.addEventListener('resize', measure)

    const t = [
      setTimeout(() => setStage(1), 1600), // right "Job searcher" bubble held ~1.6s (1s shorter)
      setTimeout(() => setStage(2), 4700), // left bubble held ~3.1s
      setTimeout(() => setStage(3), 6100), // wordmark
      setTimeout(() => setStage(4), 7200), // fly to corner
      setTimeout(() => setShow(false), 8500),
    ]
    return () => { window.removeEventListener('resize', measure); t.forEach(clearTimeout) }
  }, [])

  if (!show) return null

  const CREAM = '#F0EAD6'
  const LIGHT = '#95D5B2'
  const DARK = '#2D6A4F'
  const GREY = '#9aa0a6'

  const rightFill = stage >= 2 ? LIGHT : GREY
  const flying = stage >= 4
  const t = (delay = 0) => ({ transition: `all .75s cubic-bezier(.22,1,.36,1) ${delay}s` })
  const MARK = 300 // px, natural; scaled by `fit`

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', inset: 0, zIndex: 2147483000,
        background: '#f7f6f1', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: flying ? 0 : 1,
        transition: 'opacity .8s ease .3s',
        pointerEvents: flying ? 'none' : 'auto',
      }}
    >
      <div
        ref={sceneRef}
        style={{
          display: 'flex', alignItems: 'center', gap: '2rem',
          transformOrigin: 'center center',
          // Fit-to-screen scale until the fly-away, which shrinks toward the corner.
          transform: flying
            ? `translate(-34vw, -40vh) scale(${0.1 * fit})`
            : `scale(${fit})`,
          ...t(),
        }}
      >
        {/* Mark wrapper — bubbles are % of this, so they track the mark at any size */}
        <div style={{ position: 'relative', width: MARK, height: MARK, flexShrink: 0 }}>
          <svg width="100%" height="100%" viewBox="0 0 32 32" style={{ display: 'block', overflow: 'visible' }}>
            <rect width="32" height="32" rx="7" fill={DARK} />

            {/* RIGHT person (job searcher) — grey → green */}
            <g>
              <circle cx="23" cy="10" r="4" fill={rightFill} style={t()} />
              <path d="M17 26 Q17 18 23 18 Q29 18 29 26 Z" fill={rightFill} style={t()} />
            </g>

            {/* LEFT person (the reference) — stage 1 */}
            <g style={{ opacity: stage >= 1 ? 1 : 0, transform: stage >= 1 ? 'none' : 'translateX(-3px)', transformOrigin: 'center', ...t() }}>
              <circle cx="9" cy="10" r="4" fill={CREAM} />
              <path d="M3 26 Q3 18 9 18 Q15 18 15 26 Z" fill={CREAM} />
            </g>

            {/* The hand (arrow) — stage 2 */}
            <g style={{ opacity: stage >= 2 ? 1 : 0, ...t(.12) }}>
              <path d="M14 20 Q18 17 20 17" stroke={LIGHT} strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <polygon points="20,17 16.5,14.5 16.5,19.5" fill={LIGHT} />
            </g>

            {/* Approved check — stage 2 */}
            <g style={{ opacity: stage >= 2 ? 1 : 0, transform: stage >= 2 ? 'scale(1)' : 'scale(0)', transformOrigin: '28px 5px', transition: 'all .5s cubic-bezier(.34,1.56,.64,1) .3s' }}>
              <circle cx="28" cy="5" r="4" fill={CREAM} />
              <polyline points="25.8,5 27,6.3 30.2,3" stroke={DARK} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>

          <Bubble side="right" show={stage === 0} text="Job searcher" />
          <Bubble side="left" show={stage === 1} text="Hey, you are the best resource that I know, for any company" />
        </div>

        {/* Wordmark — stage 3 */}
        <span
          style={{
            fontFamily: 'var(--sans, Manrope, sans-serif)', fontSize: '5rem', fontWeight: 800,
            letterSpacing: '-.02em', lineHeight: 1, whiteSpace: 'nowrap',
            opacity: stage >= 3 ? 1 : 0, transform: stage >= 3 ? 'none' : 'translateX(-10px)',
            ...t(),
          }}
        >
          <span style={{ color: 'var(--ink, #1B4332)' }}>Recomme</span>
          <span style={{ color: '#52B788' }}>Now</span>
        </span>
      </div>
    </div>
  )
}

function Bubble({ side, show, text }: { side: 'left' | 'right'; show: boolean; text: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: side === 'left' ? '28%' : '72%',
        top: '16%',
        transform: `translate(-50%, -100%) scale(${show ? 1 : 0.85})`,
        transformOrigin: 'bottom center',
        opacity: show ? 1 : 0,
        transition: 'all .5s cubic-bezier(.34,1.56,.64,1)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: '#fff', color: 'var(--ink, #1B4332)',
          border: '1px solid var(--rule, #e5e3da)',
          borderRadius: 18, padding: '.8rem 1.1rem',
          fontFamily: 'var(--sans, Manrope, sans-serif)', fontSize: '1.05rem', fontWeight: 600,
          lineHeight: 1.35, width: 'max-content', maxWidth: side === 'left' ? 300 : 200, textAlign: 'center',
          boxShadow: '0 12px 34px rgba(27,67,50,.14)',
        }}
      >
        {text}
        <span style={{
          position: 'absolute', left: '50%', bottom: -7, transform: 'translateX(-50%) rotate(45deg)',
          width: 13, height: 13, background: '#fff', borderRight: '1px solid var(--rule, #e5e3da)', borderBottom: '1px solid var(--rule, #e5e3da)',
        }} />
      </div>
    </div>
  )
}
