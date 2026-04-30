'use client'

import { useState } from 'react'

export default function FlagVouchButton({ vouchId }: { vouchId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function submit() {
    setStatus('loading')
    const res = await fetch('/api/vouches/flag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vouch_id: vouchId, reason, reporter_email: email }),
    })
    setStatus(res.ok ? 'done' : 'error')
    if (res.ok) setTimeout(() => setOpen(false), 1800)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '.65rem',
          color: 'var(--rule)',
          padding: '2px 6px',
          borderRadius: 4,
          transition: 'color .2s',
        }}
        title="Flag this vouch"
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--rule)')}
      >
        ⚑ flag
      </button>
    )
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--white)',
        border: '1px solid var(--rule)',
        borderRadius: 12,
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '.75rem',
        zIndex: 10,
      }}
    >
      {status === 'done' ? (
        <p style={{ fontSize: '.85rem', color: 'var(--green2)', fontWeight: 500 }}>
          ✓ Flag submitted — thank you.
        </p>
      ) : (
        <>
          <p style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--ink)' }}>Flag this vouch</p>
          <textarea
            className="field-textarea"
            placeholder="Why are you flagging this vouch?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ minHeight: 70 }}
          />
          <input
            className="field-input"
            type="email"
            placeholder="Your email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {status === 'error' && (
            <p style={{ fontSize: '.75rem', color: 'var(--red)' }}>Something went wrong. Please try again.</p>
          )}
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <button
              onClick={submit}
              disabled={!reason.trim() || status === 'loading'}
              className="btn-primary"
              style={{ fontSize: '.78rem', padding: '.5rem 1rem' }}
            >
              {status === 'loading' ? 'Submitting…' : 'Submit flag'}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="btn-secondary"
              style={{ fontSize: '.78rem', padding: '.5rem 1rem' }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  )
}
