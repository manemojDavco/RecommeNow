'use client'

import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CustomSignIn() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'credentials' | 'verify_device'>('credentials')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleOAuth(strategy: 'oauth_google' | 'oauth_apple' | 'oauth_linkedin_oidc') {
    if (!isLoaded || !signIn) return
    await signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/my-profile',
    })
  }

  async function handleSubmitCredentials(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded || !signIn) return
    setError('')
    setLoading(true)

    try {
      const attempt = await signIn.create({
        identifier: email,
        password,
      })

      const status = attempt.status as string
      if (status === 'complete') {
        await setActive({ session: attempt.createdSessionId })
        router.push('/my-profile')
      } else if (status === 'needs_client_trust' || status === 'needs_second_factor') {
        // Trigger email code for device verification
        await signIn.prepareSecondFactor({ strategy: 'email_code' })
        setStep('verify_device')
      } else {
        setError('Unexpected sign-in status. Please try again.')
      }
    } catch (err: unknown) {
      const msg = (err as { errors?: { message: string }[] })?.errors?.[0]?.message
      setError(msg ?? 'Sign-in failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoaded || !signIn) return
    setError('')
    setLoading(true)

    try {
      const attempt = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code,
      })

      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId })
        router.push('/my-profile')
      } else {
        setError('Verification failed. Please try again.')
      }
    } catch (err: unknown) {
      const msg = (err as { errors?: { message: string }[] })?.errors?.[0]?.message
      setError(msg ?? 'Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '.65rem .85rem',
    border: '1px solid #b7dfc6',
    borderRadius: 8,
    fontSize: '.88rem',
    fontFamily: 'Manrope, sans-serif',
    color: '#1b4332',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '.78rem',
    fontWeight: 600,
    color: '#1b4332',
    marginBottom: '.35rem',
    display: 'block',
  }

  const btnStyle: React.CSSProperties = {
    width: '100%',
    padding: '.75rem',
    background: loading ? '#52705c' : '#2D6A4F',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: '.9rem',
    fontWeight: 600,
    fontFamily: 'Manrope, sans-serif',
    cursor: loading ? 'not-allowed' : 'pointer',
    marginTop: '.5rem',
  }

  if (step === 'verify_device') {
    return (
      <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '.5rem' }}>
          <p style={{ fontSize: '.9rem', color: '#1b4332', fontWeight: 600 }}>Verify your device</p>
          <p style={{ fontSize: '.8rem', color: '#52705c', marginTop: '.35rem' }}>
            A verification code was sent to <strong>{email}</strong>. Enter it below to continue.
          </p>
        </div>

        <div>
          <label style={labelStyle}>Verification code</label>
          <input
            style={{ ...inputStyle, letterSpacing: '.2em', textAlign: 'center', fontSize: '1.1rem' }}
            type="text"
            inputMode="numeric"
            placeholder="------"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            autoFocus
            required
          />
        </div>

        {error && (
          <p style={{ fontSize: '.78rem', color: '#e53e3e', margin: 0 }}>{error}</p>
        )}

        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Verifying…' : 'Verify & sign in'}
        </button>

        <button
          type="button"
          onClick={() => { setStep('credentials'); setCode(''); setError('') }}
          style={{ background: 'none', border: 'none', color: '#52705c', fontSize: '.78rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          ← Back
        </button>
      </form>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Social login */}
      <div style={{ display: 'flex', gap: '.75rem' }}>
        {([
          { strategy: 'oauth_apple' as const, label: 'Apple', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 814 1000"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-111.2c-45.5-68.2-82.6-174.1-82.6-273.4 0-187.6 122.6-287.2 243.3-287.2 66.2 0 121.3 43.4 162.6 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/></svg> },
          { strategy: 'oauth_google' as const, label: 'Google', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 488 512"><path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" fill="#4285F4"/></svg> },
          { strategy: 'oauth_linkedin_oidc' as const, label: 'LinkedIn', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 448 512"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" fill="#0077B5"/></svg> },
        ] as const).map(({ strategy, label, icon }) => (
          <button
            key={strategy}
            type="button"
            onClick={() => handleOAuth(strategy)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
              padding: '.6rem', border: '1px solid #b7dfc6', borderRadius: 8, background: '#fff',
              cursor: 'pointer', fontSize: '.78rem', color: '#1b4332', fontFamily: 'Manrope, sans-serif',
            }}
            aria-label={`Sign in with ${label}`}
          >
            {icon}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', color: '#52705c', fontSize: '.75rem' }}>
        <div style={{ flex: 1, height: 1, background: '#b7dfc6' }} />
        or
        <div style={{ flex: 1, height: 1, background: '#b7dfc6' }} />
      </div>

    <form onSubmit={handleSubmitCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={labelStyle}>Email address</label>
        <input
          style={inputStyle}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label style={labelStyle}>Password</label>
        <div style={{ position: 'relative' }}>
          <input
            style={{ ...inputStyle, paddingRight: '2.5rem' }}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            style={{
              position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#52705c', padding: 0,
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ fontSize: '.78rem', color: '#e53e3e', margin: 0 }}>{error}</p>
      )}

      <button type="submit" disabled={loading} style={btnStyle}>
        {loading ? 'Signing in…' : 'Continue →'}
      </button>
    </form>
    </div>
  )
}
