import { SignIn } from '@clerk/nextjs'
import { Logo } from '@/components/Logo'

export const metadata = { title: 'Sign in' }

export default function SignInPage() {
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
        {/* faint background letter */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            bottom: '-8vw',
            right: '-8vw',
            opacity: 0.04,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" style={{ width: '42vw', height: '42vw' }}>
            <rect width="32" height="32" rx="7" fill="#fff"/>
            <circle cx="9" cy="10" r="4" fill="#2D6A4F"/>
            <path d="M3 26 Q3 18 9 18 Q15 18 15 26 Z" fill="#2D6A4F"/>
            <path d="M14 20 Q18 17 20 17" stroke="#2D6A4F" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
            <polygon points="20,17 16.5,14.5 16.5,19.5" fill="#2D6A4F"/>
            <circle cx="23" cy="10" r="4" fill="#2D6A4F"/>
            <path d="M17 26 Q17 18 23 18 Q29 18 29 26 Z" fill="#2D6A4F"/>
            <circle cx="28" cy="5" r="4" fill="#2D6A4F"/>
            <polyline points="25.8,5 27,6.3 30.2,3" stroke="#fff" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>

        <div style={{ position: 'relative' }}>
          <div style={{ marginBottom: '4rem' }}>
            <Logo variant="light" href="/" size={30} />
          </div>

          <h1
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
              fontWeight: 800,
              lineHeight: 1.22,
              letterSpacing: '-.02em',
              color: '#fff',
              marginBottom: '1.5rem',
            }}
          >
            Your reputation,{' '}
            <span style={{ color: 'rgba(255,255,255,.7)' }}>verified</span>{' '}
            by the people who know your work.
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
            Sign in to manage your vouches and share your verified reputation profile.
          </p>
        </div>

        {/* Trust badges */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {([
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="#95D5B2">
                  <path d="M12 1C9.24 1 7 3.24 7 6v1H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2V6c0-2.76-2.24-5-5-5zm0 2c1.65 0 3 1.35 3 3v1H9V6c0-1.65 1.35-3 3-3zm0 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
                </svg>
              ),
              label: 'Work email verification',
            },
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#95D5B2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ),
              label: 'Manual approval by you',
            },
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#95D5B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              ),
              label: 'Shareable public profile',
            },
          ] as { icon: React.ReactNode; label: string }[]).map((item) => (
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
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Right — Clerk sign-in */}
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
              fontFamily: 'var(--sans)',
              fontSize: '1.1rem',
              color: 'var(--ink)',
              marginBottom: '1.5rem',
            }}
          >
            Welcome back
          </p>
          <SignIn
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
