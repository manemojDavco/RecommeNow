/**
 * Shared RecommeNow logo — SVG mark + wordmark.
 * variant="dark"  → for light backgrounds (default)
 * variant="light" → for dark/green backgrounds
 */
import Link from 'next/link'

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size} style={{ display: 'block', flexShrink: 0 }}>
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

interface LogoProps {
  variant?: 'dark' | 'light'
  size?: number
  href?: string
  style?: React.CSSProperties
}

export function Logo({ variant = 'dark', size = 30, href = '/', style }: LogoProps) {
  const textColor   = variant === 'light' ? '#F0EAD6'               : 'var(--ink, #1B4332)'
  const accentColor = variant === 'light' ? '#52B788'               : 'var(--green-mid, #52b788)'

  const inner = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', textDecoration: 'none', ...style }}>
      <LogoMark size={size} />
      <span style={{
        fontFamily: 'var(--sans, Manrope, sans-serif)',
        fontStyle: 'normal',
        fontSize: `${Math.round(size * 0.58)}px`,
        fontWeight: 800,
        color: textColor,
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        Recomme<span style={{ color: accentColor }}>Now</span>
      </span>
    </span>
  )

  return href
    ? <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link>
    : inner
}

/** Inline SVG location pin — no emoji, matches brand colour. */
export function LocationPin({ color = '#2D6A4F', size = 12 }: { color?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      style={{ display: 'inline-block', flexShrink: 0, marginRight: 3, verticalAlign: 'middle', position: 'relative', top: -1 }}
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  )
}
