'use client'

import { useState } from 'react'
import type { Profile } from '@/types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'

export default function ShareEmbed({ profile }: { profile: Profile }) {
  const profileUrl = `${APP_URL}/${profile.slug}`
  const vouchUrl = `${APP_URL}/vouch/${profile.slug}`
  const referralUrl = profile.referral_code ? `${APP_URL}/r/${profile.referral_code}` : null
  const [copied, setCopied] = useState<string | null>(null)

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const embedCode = `<iframe src="${profileUrl}?embed=1" width="100%" height="600" frameborder="0" style="border:1px solid #dedad2;border-radius:12px"></iframe>`

  const emailSignature = `Verified reputation: ${profileUrl}`

  const linkedinPost = `I've built a verified reputation profile on RecommeNow — real vouches from colleagues, managers and clients.\n\nSee what people say about working with me: ${profileUrl}`

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
        {[
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
            key: 'embed',
            title: 'Website embed',
            desc: 'Embed your reputation profile on your personal website or portfolio.',
            value: embedCode,
            mono: true,
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
        ].map((item) => (
          <div key={item.key} style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, padding: '1.25rem' }}>
            <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.2rem' }}>{item.title}</p>
            <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.75rem' }}>{item.desc}</p>
            <div
              style={{
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
              }}
            >
              {item.value}
            </div>
            <button
              onClick={() => copy(item.value, item.key)}
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
        ))}
      </div>
    </div>
  )
}
