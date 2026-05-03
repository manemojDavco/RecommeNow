import Link from 'next/link'
import type { Vouch } from '@/types'
import Stars from './Stars'

export default function VouchCard({ vouch, giverSlug }: { vouch: Vouch; giverSlug?: string | null }) {
  const initials = vouch.giver_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const avatarColors = ['#4a7c59', '#2d5a8e', '#8e5a2d', '#5a2d8e', '#7c4a4a', '#4a7c7c']
  const colorIdx =
    vouch.giver_name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % avatarColors.length

  return (
    <div className="vouch-card">
      {/* relationship tag */}
      {vouch.giver_relationship && (
        <span
          style={{
            fontSize: '.62rem',
            fontWeight: 600,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            color: 'var(--green2)',
            display: 'flex',
            alignItems: 'center',
            gap: '.4rem',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              background: 'var(--green2)',
              borderRadius: '50%',
              display: 'inline-block',
            }}
          />
          {vouch.giver_relationship}
        </span>
      )}

      {/* stars */}
      <Stars rating={vouch.star_rating} />

      {/* quote */}
      <blockquote
        style={{
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          fontSize: '.93rem',
          lineHeight: 1.75,
          color: 'var(--ink2)',
          flex: 1,
        }}
      >
        "{vouch.quote}"
      </blockquote>

      {/* traits */}
      {vouch.traits && vouch.traits.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
          {vouch.traits.map((t) => (
            <span key={t} className="trait-pill">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* person */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '.75rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--rule)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: avatarColors[colorIdx],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '.65rem',
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--ink)' }}>
            {giverSlug ? (
              <Link
                href={`/${giverSlug}`}
                style={{ color: 'var(--green2)', textDecoration: 'none', fontWeight: 600 }}
                title="View RecommeNow profile"
              >
                {vouch.giver_name} ↗
              </Link>
            ) : vouch.giver_name}
          </div>
          {(vouch.giver_title || vouch.giver_company) && (
            <div style={{ fontSize: '.72rem', fontWeight: 300, color: 'var(--muted)', marginTop: 1 }}>
              {[vouch.giver_title, vouch.giver_company].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
        {vouch.verified && (
          <span className="badge-verified">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1.5 4L3 5.5L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Verified
          </span>
        )}
      </div>
    </div>
  )
}
