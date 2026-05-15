'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import Link from 'next/link'
import type { Profile } from '@/types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

export default function ShareEmbed({ profile }: { profile: Profile }) {
  const isPro = profile.plan === 'pro' || profile.recruiter_active
  const profileUrl = `${APP_URL}/${profile.slug}`
  const vouchUrl = `${APP_URL}/vouch/${profile.slug}`
  const referralUrl = profile.slug ? `${APP_URL}/referredby/${profile.slug}` : null
  const [copied, setCopied] = useState<string | null>(null)

  // Vouch request emailer state
  const [emailInput, setEmailInput] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [sendResult, setSendResult] = useState<{ sent: number; total: number } | null>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)

  function addEmail(raw: string) {
    const val = raw.trim().replace(/,+$/, '')
    if (!val) return
    if (!isValidEmail(val)) return
    if (emails.includes(val)) { setEmailInput(''); return }
    if (emails.length >= 10) return
    setEmails(prev => [...prev, val])
    setEmailInput('')
  }

  function handleEmailKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addEmail(emailInput)
    } else if (e.key === 'Backspace' && emailInput === '' && emails.length > 0) {
      setEmails(prev => prev.slice(0, -1))
    }
  }

  function removeEmail(email: string) {
    setEmails(prev => prev.filter(e => e !== email))
  }

  async function sendEmails() {
    const toSend = emailInput.trim() ? [...emails, ...(isValidEmail(emailInput) ? [emailInput.trim()] : [])] : emails
    if (!toSend.length) return
    setSendStatus('sending')
    try {
      const res = await fetch('/api/share/send-vouch-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: toSend }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSendResult({ sent: data.sent, total: data.total })
      setSendStatus('done')
      setEmails([])
      setEmailInput('')
    } catch {
      setSendStatus('error')
    }
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const embedCode = `<iframe src="${profileUrl}?embed=1" width="100%" height="600" frameborder="0" style="border:1px solid #b7dfc6;border-radius:12px;"></iframe>`

  const emailSignature = `Verified reputation: ${profileUrl}`

  const linkedinPost = `I've built a verified reputation profile on RecommeNow. Real vouches from colleagues, managers and clients.\n\nSee what people say about working with me: ${profileUrl}`

  const freeItems = [
    {
      key: 'profile',
      title: 'Your public profile link',
      desc: 'Share this anywhere: job applications, LinkedIn, email signatures.',
      value: profileUrl,
    },
    {
      key: 'vouch',
      title: 'Your vouch request link',
      desc: 'Send this to colleagues, managers and clients to request a vouch.',
      value: vouchUrl,
    },
    {
      key: 'email',
      title: 'Email signature',
      desc: 'Add your verified profile link to your email signature.',
      value: emailSignature,
    },
    {
      key: 'linkedin',
      title: 'LinkedIn post template',
      desc: 'Announce your verified profile on LinkedIn.',
      value: linkedinPost,
    },
    ...(referralUrl ? [{
      key: 'referral',
      title: 'Refer a colleague',
      desc: `Share this link with colleagues. When they join RecommeNow, they'll be linked to you. You've referred ${profile.referral_count} ${profile.referral_count === 1 ? 'person' : 'people'} so far.`,
      value: referralUrl,
    }] : []),
  ]

  return (
    <div style={{ padding: '2rem 2.5rem', flex: 1 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--sans)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.25rem' }}>
          Share & Embed
        </h1>
        <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
          Share your profile or request vouches from anywhere.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 680 }}>

        {/* Free share links */}
        {freeItems.map((item) => (
          <CopyCard key={item.key} item={item} copied={copied} onCopy={copy} />
        ))}

        {/* ── Send vouch request emails ── */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, padding: '1.25rem' }}>
          <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.2rem' }}>
            Send vouch request
          </p>
          <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            Enter email addresses and we'll send them a short email with your vouch link. Up to 10 at a time.
          </p>

          {/* Email tag input */}
          <div
            onClick={() => emailInputRef.current?.focus()}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '.35rem',
              minHeight: 44,
              background: 'var(--paper)',
              border: '1.5px solid var(--rule)',
              borderRadius: 8,
              padding: '.45rem .6rem',
              cursor: 'text',
              marginBottom: '.75rem',
            }}
          >
            {emails.map(email => (
              <span
                key={email}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '.25rem',
                  background: 'var(--green)',
                  color: '#fff',
                  borderRadius: 100,
                  padding: '2px 10px 2px 10px',
                  fontSize: '.75rem',
                  fontWeight: 500,
                }}
              >
                {email}
                <button
                  onClick={(e) => { e.stopPropagation(); removeEmail(email) }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', cursor: 'pointer', fontSize: '.9rem', padding: '0 0 0 2px', lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              ref={emailInputRef}
              value={emailInput}
              onChange={e => { setEmailInput(e.target.value); setSendStatus('idle') }}
              onKeyDown={handleEmailKeyDown}
              onBlur={() => addEmail(emailInput)}
              placeholder={emails.length === 0 ? 'colleague@company.com, another@email.com…' : ''}
              disabled={emails.length >= 10}
              style={{
                flex: 1,
                minWidth: 180,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '.8rem',
                color: 'var(--ink)',
                fontFamily: 'var(--sans)',
                padding: '2px 4px',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={sendEmails}
              disabled={sendStatus === 'sending' || (emails.length === 0 && !emailInput.trim())}
              style={{
                background: 'var(--green)',
                color: '#fff',
                border: 'none',
                borderRadius: 7,
                padding: '.55rem 1.2rem',
                fontSize: '.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--sans)',
                opacity: sendStatus === 'sending' || (emails.length === 0 && !emailInput.trim()) ? 0.5 : 1,
                transition: 'opacity .15s',
              }}
            >
              {sendStatus === 'sending' ? 'Sending…' : 'Send request'}
            </button>
            {sendStatus === 'done' && sendResult && (
              <span style={{ fontSize: '.78rem', color: 'var(--green2)', fontWeight: 600 }}>
                ✓ Sent to {sendResult.sent} {sendResult.sent === 1 ? 'person' : 'people'}
              </span>
            )}
            {sendStatus === 'error' && (
              <span style={{ fontSize: '.78rem', color: 'var(--red)' }}>
                Something went wrong. Please try again.
              </span>
            )}
            {emails.length > 0 && sendStatus === 'idle' && (
              <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>
                {emails.length} recipient{emails.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '.6rem' }}>
            Press Enter or comma to add each email. Replies go to your email address.
          </p>
        </div>

        {/* ── Pro-gated: Embeddable widget ── */}
        <div style={{ borderTop: '1px solid var(--rule)', paddingTop: '1.25rem', marginTop: '.25rem' }}>
          <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '1rem' }}>
            Pro features
          </p>

          {isPro ? (
            <>
              <CopyCard
                item={{
                  key: 'embed',
                  title: 'Embeddable widget',
                  desc: 'Paste this iframe on your personal website or portfolio to display your live vouches.',
                  value: embedCode,
                  mono: true,
                }}
                copied={copied}
                onCopy={copy}
              />

              {/* PDF one-pager */}
              <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, padding: '1.25rem', marginTop: '1.25rem' }}>
                <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.2rem' }}>PDF one-pager</p>
                <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.75rem' }}>
                  Download a print-ready one-page summary of your profile and top vouches. Perfect for attaching to job applications.
                </p>
                <a
                  href={`/${profile.slug}/print`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '.5rem',
                    background: 'var(--green)',
                    color: '#fff',
                    borderRadius: 7,
                    padding: '.5rem 1.1rem',
                    fontSize: '.78rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Open PDF view →
                </a>
                <p style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '.5rem' }}>
                  Opens in a new tab. Use your browser's Print / Save as PDF (Ctrl+P or ⌘+P).
                </p>
              </div>
            </>
          ) : (
            <div style={{
              background: 'var(--paper)',
              border: '1.5px dashed var(--rule)',
              borderRadius: 10,
              padding: '1.75rem',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.4rem' }}>
                Embeddable widget + PDF one-pager
              </p>
              <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                Embed your vouches on any website and download a print-ready PDF one-pager.<br />
                Available on the Pro plan.
              </p>
              <Link
                href="/pricing"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: 'var(--green)', color: '#fff', borderRadius: 7, padding: '.55rem 1.1rem', fontSize: '.78rem', fontWeight: 600, textDecoration: 'none' }}
              >
                Upgrade to Pro →
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function CopyCard({ item, copied, onCopy }: {
  item: { key: string; title: string; desc: string; value: string; mono?: boolean }
  copied: string | null
  onCopy: (text: string, key: string) => void
}) {
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, padding: '1.25rem' }}>
      <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.2rem' }}>{item.title}</p>
      <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.75rem' }}>{item.desc}</p>
      <div style={{
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 7,
        padding: '.7rem .9rem',
        fontSize: '.78rem',
        color: 'var(--ink2)',
        fontFamily: item.mono ? 'monospace' : 'var(--sans)',
        marginBottom: '.75rem',
        wordBreak: 'break-all',
        whiteSpace: item.mono ? 'pre-wrap' : 'normal',
        maxHeight: 100,
        overflowY: 'auto',
      }}>
        {item.value}
      </div>
      <button
        onClick={() => onCopy(item.value, item.key)}
        style={{
          background: copied === item.key ? 'var(--green-l)' : 'var(--white)',
          color: copied === item.key ? 'var(--green2)' : 'var(--muted)',
          border: `1px solid ${copied === item.key ? 'var(--green-m)' : 'var(--rule)'}`,
          borderRadius: 7,
          padding: '.45rem .9rem',
          fontSize: '.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--sans)',
          transition: 'all .15s',
        }}
      >
        {copied === item.key ? '✓ Copied!' : 'Copy'}
      </button>
    </div>
  )
}
