'use client'

import { useState } from 'react'
import Link from 'next/link'

type Props = {
  candidateSlug: string
  candidateName: string
  candidatePhone: string | null
  candidateEmail: string | null
  isRecruiter: boolean
  isSignedIn: boolean
}

export default function RecruiterContactButton({ candidateSlug, candidateName, candidatePhone, candidateEmail, isRecruiter, isSignedIn }: Props) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ company: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isSignedIn) {
    return (
      <Link
        href="/pricing#recruiter"
        style={{
          display: 'block',
          background: 'var(--white)',
          border: '1.5px solid var(--rule)',
          borderRadius: 9,
          padding: '.65rem',
          fontSize: '.78rem',
          fontWeight: 600,
          color: 'var(--muted)',
          textDecoration: 'none',
          textAlign: 'center',
        }}
      >
        Recruiter? Contact {candidateName.split(' ')[0]}
      </Link>
    )
  }

  if (!isRecruiter) {
    return (
      <Link
        href="/pricing#recruiter"
        style={{
          display: 'block',
          background: 'var(--white)',
          border: '1.5px solid var(--rule)',
          borderRadius: 9,
          padding: '.65rem',
          fontSize: '.78rem',
          fontWeight: 600,
          color: 'var(--muted)',
          textDecoration: 'none',
          textAlign: 'center',
        }}
      >
        Recruiter plan — Contact {candidateName.split(' ')[0]} →
      </Link>
    )
  }

  async function send() {
    if (!form.message.trim() || form.message.trim().length < 20) {
      setErrorMsg('Message must be at least 20 characters.')
      return
    }
    setStatus('sending')
    setErrorMsg('')
    const res = await fetch('/api/recruiter/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateSlug, company: form.company, message: form.message }),
    })
    if (res.ok) {
      setStatus('sent')
    } else {
      const data = await res.json()
      setErrorMsg(data.error ?? 'Failed to send.')
      setStatus('error')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'block',
          width: '100%',
          background: 'var(--ink)',
          color: '#fff',
          border: 'none',
          borderRadius: 9,
          padding: '.65rem',
          fontSize: '.78rem',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--sans)',
          textAlign: 'center',
        }}
      >
        Contact {candidateName.split(' ')[0]} →
      </button>

      {open && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem',
          }}
        >
          <div style={{
            background: '#fff', borderRadius: 16, padding: '2rem',
            width: '100%', maxWidth: 480,
            boxShadow: '0 20px 60px rgba(0,0,0,.18)',
          }}>
            {status === 'sent' ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✓</div>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.5rem' }}>
                  Message sent!
                </p>
                <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
                  {candidateName} will receive your message and can reply directly to your email.
                </p>
                <button
                  onClick={() => { setOpen(false); setStatus('idle'); setForm({ company: '', message: '' }) }}
                  style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, padding: '.7rem 1.5rem', fontSize: '.83rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                      Contact {candidateName}
                    </h2>
                    <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: '.25rem' }}>
                      They'll receive your message by email.
                    </p>
                  </div>
                  <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--muted)', lineHeight: 1, padding: 0 }}>×</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="field-label">Company (optional)</label>
                    <input
                      className="field-input"
                      value={form.company}
                      onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div>
                    <label className="field-label">Your message</label>
                    <textarea
                      className="field-textarea"
                      value={form.message}
                      onChange={(e) => { setForm((f) => ({ ...f, message: e.target.value })); setErrorMsg('') }}
                      placeholder={`Hi ${candidateName.split(' ')[0]}, I came across your RecommeNow profile and I'm impressed by your track record…`}
                      style={{ minHeight: 120 }}
                    />
                    <p style={{ fontSize: '.7rem', color: form.message.length < 20 ? 'var(--muted)' : 'var(--green2)', marginTop: '.3rem' }}>
                      {form.message.length}/20 min characters
                    </p>
                  </div>

                  {errorMsg && (
                    <p style={{ fontSize: '.8rem', color: 'var(--red)', background: 'var(--red-l)', padding: '.6rem .9rem', borderRadius: 7 }}>
                      {errorMsg}
                    </p>
                  )}

                  <button
                    onClick={send}
                    disabled={status === 'sending'}
                    style={{
                      background: 'var(--green)', color: '#fff', border: 'none',
                      borderRadius: 8, padding: '.8rem', fontSize: '.85rem',
                      fontWeight: 600, cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--sans)', opacity: status === 'sending' ? 0.7 : 1,
                    }}
                  >
                    {status === 'sending' ? 'Sending…' : 'Send message'}
                  </button>

                  {(candidateEmail || candidatePhone) && (
                    <div style={{ borderTop: '1px solid var(--rule)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                      <p style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.1rem' }}>
                        Direct contact details
                      </p>
                      {candidateEmail && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                          <span style={{ fontSize: '.75rem', color: 'var(--muted)', flexShrink: 0 }}>✉</span>
                          <a href={`mailto:${candidateEmail}`} style={{ fontSize: '.82rem', color: 'var(--green2)', textDecoration: 'none', fontWeight: 500, wordBreak: 'break-all' }}>
                            {candidateEmail}
                          </a>
                        </div>
                      )}
                      {candidatePhone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                          <span style={{ fontSize: '.75rem', color: 'var(--muted)', flexShrink: 0 }}>📱</span>
                          <a href={`tel:${candidatePhone.replace(/\s/g, '')}`} style={{ fontSize: '.82rem', color: 'var(--green2)', textDecoration: 'none', fontWeight: 500 }}>
                            {candidatePhone}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
