import Link from 'next/link'

export default function NotFound() {
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
      <p
        style={{
          fontFamily: 'var(--serif)',
          fontSize: '5rem',
          fontStyle: 'italic',
          color: 'var(--faint)',
          lineHeight: 1,
          marginBottom: '1.5rem',
        }}
      >
        404
      </p>
      <h1
        style={{
          fontFamily: 'var(--serif)',
          fontSize: '1.6rem',
          fontWeight: 400,
          color: 'var(--ink)',
          marginBottom: '.75rem',
        }}
      >
        Profile not found
      </h1>
      <p style={{ fontSize: '.9rem', color: 'var(--muted)', marginBottom: '2rem', fontWeight: 300 }}>
        This profile doesn't exist or may have been removed.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
        <Link href="/sign-up" className="btn-secondary">
          Build my profile
        </Link>
      </div>
    </div>
  )
}
