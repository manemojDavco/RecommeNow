import { ImageResponse } from 'next/og'
import { createServiceClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'
export const alt = 'RecommeNow profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = createServiceClient()

  const { data: profile } = await db.from('profiles').select('name,title,location').eq('slug', slug).single()
  const { data: stats } = await db.from('profile_stats').select('approved_count,trust_score,verification_rate').eq('slug', slug).single()

  const name = profile?.name ?? 'RecommeNow profile'
  const title = profile?.title ?? ''
  const location = profile?.location ?? ''
  const vouchCount = stats?.approved_count ?? 0
  const trustScore = stats?.trust_score ?? 0
  const verifiedPct = stats?.verification_rate ?? 0

  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#f8f7f3',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Top green bar */}
        <div style={{ background: '#1a5c3a', height: 8, width: '100%', display: 'flex' }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '56px 80px', justifyContent: 'space-between' }}>
          {/* Top row: logo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 20, color: '#6b7280', fontStyle: 'italic' }}>
              Recomme<span style={{ color: '#1a5c3a' }}>Now</span>
            </div>
            <div style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500, fontFamily: 'sans-serif' }}>
              Verified peer reputation
            </div>
          </div>

          {/* Middle: profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
            {/* Avatar */}
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              background: '#e8f4ed',
              border: '3px solid #1a5c3a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, fontStyle: 'italic', fontWeight: 700, color: '#1a5c3a',
              flexShrink: 0,
            }}>
              {initials}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 56, fontWeight: 700, color: '#1c1917', lineHeight: 1.1 }}>{name}</div>
              {title && <div style={{ fontSize: 26, color: '#6b7280', fontFamily: 'sans-serif', fontWeight: 400 }}>{title}{location ? ` · ${location}` : ''}</div>}
            </div>
          </div>

          {/* Bottom: stats */}
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { value: String(vouchCount), label: vouchCount === 1 ? 'vouch' : 'vouches' },
              { value: trustScore > 0 ? `${trustScore}/5` : '—', label: 'trust score' },
              { value: `${verifiedPct}%`, label: 'email-verified' },
            ].map(({ value, label }) => (
              <div key={label} style={{
                background: '#fff',
                border: '1px solid #e5e2dc',
                borderRadius: 12,
                padding: '16px 28px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                minWidth: 130,
              }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#1a5c3a', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 14, color: '#9ca3af', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
