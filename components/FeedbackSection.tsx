'use client'

import { useState } from 'react'

export function FeedbackSection({ prefillEmail }: { prefillEmail?: string }) {
  const [expanded, setExpanded] = useState(false)
  const [email, setEmail] = useState(prefillEmail ?? '')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
      setMessage('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section style={{ background: 'var(--paper)', padding: '5rem 2.5rem' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {/* Always-visible header — click to expand */}
        <button
          onClick={() => { if (status !== 'sent') setExpanded(v => !v) }}
          style={{
            all: 'unset',
            display: 'block',
            width: '100%',
            cursor: status === 'sent' ? 'default' : 'pointer',
          }}
        >
          <p style={{
            fontSize: '.68rem', fontWeight: 600, letterSpacing: '.16em',
            textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem',
          }}>
            Feedback
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <h2 style={{
              fontFamily: 'var(--sans)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: 'var(--ink)',
              margin: 0,
            }}>
              Share your{' '}
              <span style={{ color: 'var(--green-mid, #52B788)' }}>thoughts</span>.
            </h2>
            {status !== 'sent' && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--green-l, #d8f3dc)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'transform .2s',
                transform: expanded ? 'rotate(180deg)' : 'none',
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4.5L6 8.5L10 4.5" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
        </button>

        {/* Expandable content */}
        {(expanded || status === 'sent') && (
          <div style={{ marginTop: '2rem' }}>
            {status === 'sent' ? (
              <div style={{
                background: 'var(--green-l, #d8f3dc)',
                border: '1px solid var(--green, #1B4332)',
                borderRadius: 10,
                padding: '1.5rem',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--green)', margin: 0 }}>
                  Thanks for the feedback! 🙌
                </p>
                <p style={{ fontSize: '.85rem', color: 'var(--muted)', margin: '.5rem 0 0' }}>
                  We'll read it and get back to you if needed.
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '.93rem', color: 'var(--muted)', lineHeight: 1.75, marginBottom: '1.75rem' }}>
                  We read every message. Tell us what you love, what's missing, or what could be better.
                </p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {!prefillEmail && (
                    <div>
                      <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '.4rem' }}>
                        Your email
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '.75rem 1rem',
                          border: '1px solid var(--rule)',
                          borderRadius: 8,
                          fontSize: '.9rem',
                          color: 'var(--ink)',
                          background: '#fff',
                          outline: 'none',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  )}

                  {prefillEmail && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: 'var(--green)', flexShrink: 0,
                      }} />
                      <span style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
                        Sending as <strong style={{ color: 'var(--ink)' }}>{prefillEmail}</strong>
                      </span>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '.4rem' }}>
                      Message
                    </label>
                    <textarea
                      placeholder="What's on your mind?"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required
                      rows={5}
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '.75rem 1rem',
                        border: '1px solid var(--rule)',
                        borderRadius: 8,
                        fontSize: '.9rem',
                        color: 'var(--ink)',
                        background: '#fff',
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        lineHeight: 1.6,
                      }}
                    />
                  </div>

                  {status === 'error' && (
                    <p style={{ fontSize: '.82rem', color: '#dc2626', margin: 0 }}>
                      Something went wrong. Please try again.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    style={{
                      alignSelf: 'flex-start',
                      background: 'var(--green)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '.85rem 2rem',
                      fontSize: '.88rem',
                      fontWeight: 600,
                      cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                      opacity: status === 'sending' ? 0.7 : 1,
                      fontFamily: 'inherit',
                      transition: 'opacity .15s',
                    }}
                  >
                    {status === 'sending' ? 'Sending…' : 'Send feedback →'}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
