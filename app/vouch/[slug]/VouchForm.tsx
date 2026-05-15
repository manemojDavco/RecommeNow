'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

const TRAITS = [
  'Strategic thinking',
  'Communication',
  'Delivery',
  'Leadership',
  'Collaboration',
  'Problem solving',
  'Technical depth',
  'Creativity',
  'Reliability',
  'Empathy',
  'Commercial acumen',
  'Mentorship',
  'Adaptability',
  'Decision making',
  'Ownership',
  'Attention to detail',
  'Coaching',
  'Negotiation',
  'Data-driven',
  'Cross-functional',
]

const RELATIONSHIPS = [
  'Direct manager',
  'Skip-level manager',
  'Peer / colleague',
  'Ex-colleague',
  'Direct report',
  'Friend',
  'Client',
  'Vendor / partner',
  'Investor',
  'Other',
]

type Profile = {
  id: string
  name: string
  slug: string
  title: string | null
  years_experience: string | null
}

type Step = 1 | 2 | 3 | 4

export default function VouchForm({ profile }: { profile: Profile }) {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState({
    giver_name: '',
    giver_title: '',
    giver_company: '',
    giver_email: '',
    giver_relationship: '',
    traits: [] as string[],
    quote: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const firstName = profile.name.split(' ')[0]
  const progress = (step / 4) * 100

  function toggleTrait(t: string) {
    setForm((f) => ({
      ...f,
      traits: f.traits.includes(t) ? f.traits.filter((x) => x !== t) : [...f.traits, t],
    }))
  }

  function canAdvance() {
    if (step === 1) return form.giver_name.trim() && form.giver_email.trim() && form.giver_relationship
    if (step === 2) return form.traits.length >= 1
    if (step === 3) return form.quote.trim().length >= 30
    return false
  }

  async function submit() {
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/vouches/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, profile_id: profile.id }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
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
          Vouch submitted!
        </h1>
        <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 400, marginBottom: '2rem' }}>
          Thanks for vouching for {firstName}. Check your inbox. We've sent a verification email to confirm your submission.
        </p>
        <Link
          href={`/${profile.slug}`}
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
          View {firstName}'s profile →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--white)', fontFamily: 'var(--sans)' }}>
      {/* Top bar */}
      <div
        style={{
          padding: '1rem 2.5rem',
          borderBottom: '1px solid var(--rule)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--white)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <Logo variant="dark" href="/" size={30} />
        <span style={{ fontSize: '.68rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '.06em' }}>
          STEP {step} OF 4
        </span>

        {/* Progress bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'var(--faint)' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--green)',
              borderRadius: '0 2px 2px 0',
              transition: 'width .5s cubic-bezier(.4,0,.2,1)',
            }}
          />
        </div>
      </div>

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 560,
          width: '100%',
          margin: '0 auto',
          padding: '2.5rem 1.5rem 6rem',
        }}
      >
        {/* Requester card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: 'var(--paper)',
            border: '1px solid var(--rule)',
            borderRadius: 12,
            padding: '1rem 1.25rem',
            marginBottom: '2.5rem',
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'var(--green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--sans)',
              fontWeight: 700,
              fontSize: '.9rem',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--ink)' }}>
              {profile.name} is asking for a vouch
            </p>
            {profile.title && (
              <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 2 }}>{profile.title}</p>
            )}
          </div>
        </div>

        {/* ── STEP 1: About you ── */}
        {step === 1 && (
          <div className="animate-fade-up">
            <h2 style={{ fontFamily: 'var(--sans)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.5rem' }}>
              First, tell us about yourself
            </h2>
            <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '2rem', fontWeight: 300 }}>
              This helps {firstName} and readers understand the context of your vouch.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label className="field-label">Your full name *</label>
                <input
                  className="field-input"
                  placeholder="Jane Smith"
                  value={form.giver_name}
                  onChange={(e) => setForm((f) => ({ ...f, giver_name: e.target.value }))}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="field-label">Your job title</label>
                  <input
                    className="field-input"
                    placeholder="VP Product"
                    value={form.giver_title}
                    onChange={(e) => setForm((f) => ({ ...f, giver_title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="field-label">Company</label>
                  <input
                    className="field-input"
                    placeholder="Acme Corp"
                    value={form.giver_company}
                    onChange={(e) => setForm((f) => ({ ...f, giver_company: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="field-label">Work email * (for verification)</label>
                <input
                  className="field-input"
                  type="email"
                  placeholder="jane@company.com"
                  value={form.giver_email}
                  onChange={(e) => setForm((f) => ({ ...f, giver_email: e.target.value }))}
                />
                <p style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '.35rem' }}>
                  We'll send you a one-click verification link.
                </p>
              </div>
              <div>
                <label className="field-label">Your relationship to {firstName} *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.4rem' }}>
                  {RELATIONSHIPS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setForm((f) => ({ ...f, giver_relationship: r }))}
                      style={{
                        padding: '.45rem .9rem',
                        borderRadius: 100,
                        border: `1.5px solid ${form.giver_relationship === r ? 'var(--green)' : 'var(--rule)'}`,
                        background: form.giver_relationship === r ? 'var(--green-l)' : 'var(--white)',
                        color: form.giver_relationship === r ? 'var(--green)' : 'var(--muted)',
                        fontSize: '.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--sans)',
                        transition: 'all .15s',
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Traits ── */}
        {step === 2 && (
          <div className="animate-fade-up">
            <h2 style={{ fontFamily: 'var(--sans)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.5rem' }}>
              How would you describe {firstName}?
            </h2>
            <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '2rem', fontWeight: 300 }}>
              Pick 1–5 traits that best describe their strengths.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem' }}>
              {TRAITS.map((t) => {
                const selected = form.traits.includes(t)
                const maxReached = form.traits.length >= 5
                return (
                  <button
                    key={t}
                    onClick={() => toggleTrait(t)}
                    disabled={!selected && maxReached}
                    style={{
                      padding: '.55rem 1.1rem',
                      borderRadius: 100,
                      border: `1.5px solid ${selected ? 'var(--green)' : 'var(--rule)'}`,
                      background: selected ? 'var(--green)' : 'var(--white)',
                      color: selected ? '#fff' : (!selected && maxReached ? 'var(--rule)' : 'var(--ink)'),
                      fontSize: '.82rem',
                      fontWeight: selected ? 600 : 400,
                      cursor: selected || !maxReached ? 'pointer' : 'not-allowed',
                      fontFamily: 'var(--sans)',
                      transition: 'all .15s',
                    }}
                  >
                    {selected && '✓ '}{t}
                  </button>
                )
              })}
            </div>

            {form.traits.length > 0 && (
              <p style={{ fontSize: '.75rem', color: 'var(--green2)', marginTop: '1rem', fontWeight: 500 }}>
                {form.traits.length} selected{form.traits.length >= 5 ? ' (max)' : ''}
              </p>
            )}
          </div>
        )}

        {/* ── STEP 3: Quote + Rating ── */}
        {step === 3 && (
          <div className="animate-fade-up">
            <h2 style={{ fontFamily: 'var(--sans)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.5rem' }}>
              Write your vouch for {firstName}
            </h2>
            <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '2rem', fontWeight: 300 }}>
              Be specific: the best vouches describe a situation, skill or outcome.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label className="field-label">Your vouch * (min 30 characters)</label>
                <textarea
                  className="field-textarea"
                  placeholder={`Describe what it was like working with ${firstName}. What did they do well? What made them stand out?`}
                  value={form.quote}
                  onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                  style={{ minHeight: 140 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '.35rem' }}>
                  <span style={{ fontSize: '.7rem', color: 'var(--muted)' }}>
                    {form.quote.length < 30
                      ? `${30 - form.quote.length} more characters needed`
                      : `${form.quote.length} characters`}
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── STEP 4: Review ── */}
        {step === 4 && (
          <div className="animate-fade-up">
            <h2 style={{ fontFamily: 'var(--sans)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.5rem' }}>
              Review your vouch
            </h2>
            <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '2rem', fontWeight: 300 }}>
              Once submitted, {firstName} will review your vouch before it goes live.
            </p>

            <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <p style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--ink)' }}>{form.giver_name}</p>
                <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: 2 }}>
                  {[form.giver_title, form.giver_company].filter(Boolean).join(' · ')}
                </p>
                <p style={{ fontSize: '.72rem', color: 'var(--green2)', marginTop: 4, fontWeight: 600 }}>
                  {form.giver_relationship}
                </p>
              </div>

              <blockquote style={{ fontFamily: 'var(--sans)', fontSize: '.93rem', lineHeight: 1.7, color: 'var(--ink2)' }}>
                "{form.quote}"
              </blockquote>

              {form.traits.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                  {form.traits.map((t) => (
                    <span key={t} className="trait-pill">{t}</span>
                  ))}
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--rule)', paddingTop: '1rem', fontSize: '.75rem', color: 'var(--muted)' }}>
                Verification email will be sent to: <strong style={{ color: 'var(--ink)' }}>{form.giver_email}</strong>
              </div>
            </div>

            {errorMsg && (
              <p style={{ fontSize: '.8rem', color: 'var(--red)', marginTop: '1rem', background: 'var(--red-l)', padding: '.6rem .9rem', borderRadius: 7 }}>
                {errorMsg}
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem' }}>
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="btn-secondary"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={!canAdvance()}
              className="btn-primary"
              style={{ opacity: canAdvance() ? 1 : 0.4, cursor: canAdvance() ? 'pointer' : 'not-allowed' }}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={status === 'loading'}
              className="btn-primary"
            >
              {status === 'loading' ? 'Submitting…' : 'Submit vouch →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
