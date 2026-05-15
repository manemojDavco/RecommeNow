import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = "RecommeNow — Don't just apply. Get vouched."
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 100px',
          background: '#1b4332',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo mark + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px', marginBottom: '60px' }}>
          <svg width="84" height="84" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" rx="40" fill="#2D6A4F" />
            <circle cx="58" cy="62" r="24" fill="#F0EAD6" />
            <path d="M22 160 Q22 108 58 108 Q94 108 94 160 Z" fill="#F0EAD6" />
            <path d="M90 122 Q107 112 114 112" stroke="#95D5B2" strokeWidth="7" fill="none" strokeLinecap="round" />
            <polygon points="114,112 104,104 104,120" fill="#95D5B2" />
            <circle cx="142" cy="62" r="24" fill="#95D5B2" />
            <path d="M106 160 Q106 108 142 108 Q178 108 178 160 Z" fill="#95D5B2" />
            <circle cx="166" cy="36" r="17" fill="#F0EAD6" />
            <circle cx="166" cy="36" r="13" fill="#2D6A4F" />
            <polyline points="159,36 163,41 173,28" stroke="#F0EAD6" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ display: 'flex', fontSize: 52, fontWeight: 800, letterSpacing: '-0.02em' }}>
            <span style={{ color: '#f0ead6' }}>Recomme</span>
            <span style={{ color: '#52b788' }}>Now</span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 84,
            fontWeight: 800,
            color: '#f0ead6',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
          }}
        >
          <span>Don't just apply.</span>
          <span style={{ color: '#52b788' }}>Get vouched.</span>
        </div>

        {/* Subline */}
        <div
          style={{
            display: 'flex',
            marginTop: 40,
            fontSize: 28,
            color: 'rgba(240, 234, 214, 0.75)',
            lineHeight: 1.4,
            maxWidth: 900,
          }}
        >
          Verified peer endorsements from real colleagues, managers and clients.
        </div>
      </div>
    ),
    { ...size },
  )
}
