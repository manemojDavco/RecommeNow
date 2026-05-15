import Link from 'next/link'

export const metadata = { title: 'Vouch verified' }

export default function VouchVerifiedPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        background: 'var(--white)',
        fontFamily: 'var(--sans)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          background: 'var(--green-l)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M6 14L11 19L22 9" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1
        style={{
          fontFamily: 'var(--sans)',
          fontSize: '1.8rem',
          fontWeight: 800,
          color: 'var(--ink)',
          marginBottom: '.75rem',
        }}
      >
        Email verified!
      </h1>
      <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 380, marginBottom: '2rem' }}>
        Your vouch has been verified. The candidate will review it before publishing it on their profile.
      </p>
      <Link
        href="/"
        style={{
          background: 'var(--green)',
          color: '#fff',
          borderRadius: 7,
          padding: '.7rem 1.4rem',
          fontSize: '.82rem',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Learn about RecommeNow →
      </Link>
    </div>
  )
}
