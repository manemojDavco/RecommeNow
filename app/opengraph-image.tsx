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
        {/* Logo + brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '60px' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: '#52b788',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 800,
              color: '#1b4332',
            }}
          >
            R
          </div>
          <div style={{ display: 'flex', fontSize: 44, fontWeight: 800, letterSpacing: '-0.02em' }}>
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
