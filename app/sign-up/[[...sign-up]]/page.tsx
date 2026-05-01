import { SignUp } from '@clerk/nextjs'

export const metadata = { title: 'Create account' }

export default function SignUpPage() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100vh',
        fontFamily: 'var(--sans)',
      }}
    >
      {/* Left — green panel */}
      <div
        style={{
          background: 'var(--green)',
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span
          aria-hidden
          style={{
            fontFamily: 'var(--serif)',
            fontSize: '42vw',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,.03)',
            position: 'absolute',
            bottom: '-12vw',
            right: '-8vw',
            lineHeight: 1,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          R
        </span>

        <div style={{ position: 'relative' }}>
          <a
            href="/"
            style={{
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,.5)',
              textDecoration: 'none',
              display: 'inline-block',
              marginBottom: '4rem',
            }}
          >
            Recomme<span style={{ color: 'rgba(255,255,255,.85)' }}>Now</span>
          </a>

          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
              fontWeight: 400,
              lineHeight: 1.22,
              letterSpacing: '-.02em',
              color: '#fff',
              marginBottom: '1.5rem',
            }}
          >
            Build your verified reputation in{' '}
            <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,.7)' }}>minutes</em>.
          </h1>

          <p
            style={{
              fontSize: '.9rem',
              fontWeight: 300,
              lineHeight: 1.75,
              color: 'rgba(255,255,255,.55)',
              maxWidth: '340px',
            }}
          >
            Collect vouches from colleagues, managers and clients. Share a public profile anywhere you apply.
          </p>
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {[
            { icon: '✉️', label: 'Magic link · Google · LinkedIn · Apple' },
            { icon: '⚡', label: 'Free to get started' },
            { icon: '🔒', label: 'Your data, your control' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '.75rem',
                fontSize: '.78rem',
                color: 'rgba(255,255,255,.5)',
              }}
            >
              <span style={{ fontSize: '.8rem' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Right — Clerk sign-up */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          background: 'var(--white)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <p
            style={{
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontSize: '1.1rem',
              color: 'var(--ink)',
              marginBottom: '1.5rem',
            }}
          >
            Create your account
          </p>
          <SignUp
            appearance={{
              variables: {
                colorPrimary: '#2D6A4F',
                colorBackground: '#ffffff',
                colorText: '#1b4332',
                colorTextSecondary: '#52705c',
                borderRadius: '8px',
                fontFamily: 'Manrope, sans-serif',
              },
              elements: {
                card: { boxShadow: 'none', border: '1px solid #b7dfc6', borderRadius: '12px' },
                footer: { background: '#ffffff' },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
