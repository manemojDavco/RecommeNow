'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Profile } from '@/types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'

export default function ShareEmbed({ profile }: { profile: Profile }) {
  const isPro = profile.plan === 'pro' || profile.recruiter_active
  const profileUrl = `${APP_URL}/${profile.slug}`
  const vouchUrl = `${APP_URL}/vouch/${profile.slug}`
  const referralUrl = profile.referral_code ? `${APP_URL}/r/${profile.referral_code}` : null
  const [copied, setCopied] = useState<string | null>(null)

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const embedCode = `<iframe src="${profileUrl}?embed=1" width="100%" height="600" frameborder="0" style="border:1px solid #b7dfc6;border-radius:12px;"></iframe>`

  const emailSignature = `Verified reputation: ${profileUrl}`

  const linkedinPost = `I've built a verified reputation profile on RecommeNow — real vouches from colleagues, managers and clients.\n\nSee what people say about working with me: ${profileUrl}`

  const freeItems = [
    {
      key: 'profile',
      title: 'Your public profile link',
      desc: 'Share this anywhere — job applications, LinkedIn, email signatures.',
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
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.25rem' }}>
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
                  Opens in a new tab — use your browser's Print / Save as PDF (Ctrl+P or ⌘+P).
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
