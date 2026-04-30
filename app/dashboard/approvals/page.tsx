'use client'

import { useEffect, useState } from 'react'
import type { Vouch } from '@/types'
import Stars from '@/components/Stars'

export default function ApprovalsPage() {
  const [vouches, setVouches] = useState<Vouch[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/vouches?status=pending')
      .then((r) => r.json())
      .then((d) => {
        setVouches(d.vouches ?? [])
        setLoading(false)
      })
  }, [])

  async function handleAction(id: string, action: 'approve' | 'hide') {
    setActionLoading(id)
    await fetch(`/api/vouches/${id}/${action}`, { method: 'POST' })
    setVouches((v) => v.filter((x) => x.id !== id))
    setActionLoading(null)
  }

  return (
    <div style={{ padding: '2rem 2.5rem', flex: 1 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.25rem' }}>
          Pending approvals
        </h1>
        <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
          Review each vouch before it appears on your public profile.
        </p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Loading…</p>
      ) : vouches.length === 0 ? (
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--rule)',
            borderRadius: 10,
            padding: '4rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--muted)', fontSize: '1rem' }}>
            All caught up — no vouches pending.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {vouches.map((v) => (
            <div
              key={v.id}
              style={{
                background: 'var(--white)',
                border: '1px solid var(--rule)',
                borderRadius: 10,
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.2rem' }}>
                    <span style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--ink)' }}>{v.giver_name}</span>
                    {v.verified && (
                      <span className="badge-verified">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4L3 5.5L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Email verified
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
                    {[v.giver_title, v.giver_company].filter(Boolean).join(' · ')}
                    {v.giver_relationship && ` · ${v.giver_relationship}`}
                  </p>
                  <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.2rem' }}>{v.giver_email}</p>
                </div>
                <Stars rating={v.star_rating} />
              </div>

              <blockquote
                style={{
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: '.93rem',
                  lineHeight: 1.7,
                  color: 'var(--ink2)',
                  borderLeft: '3px solid var(--green-m)',
                  paddingLeft: '1rem',
                  marginBottom: '1rem',
                }}
              >
                "{v.quote}"
              </blockquote>

              {v.traits && v.traits.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginBottom: '1rem' }}>
                  {v.traits.map((t) => (
                    <span key={t} className="trait-pill">{t}</span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '.75rem', paddingTop: '1rem', borderTop: '1px solid var(--rule)' }}>
                <button
                  onClick={() => handleAction(v.id, 'approve')}
                  disabled={actionLoading === v.id}
                  style={{
                    background: 'var(--green)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 7,
                    padding: '.55rem 1.1rem',
                    fontSize: '.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--sans)',
                    opacity: actionLoading === v.id ? 0.6 : 1,
                  }}
                >
                  ✓ Approve & publish
                </button>
                <button
                  onClick={() => handleAction(v.id, 'hide')}
                  disabled={actionLoading === v.id}
                  style={{
                    background: 'var(--white)',
                    color: 'var(--muted)',
                    border: '1px solid var(--rule)',
                    borderRadius: 7,
                    padding: '.55rem 1.1rem',
                    fontSize: '.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--sans)',
                    opacity: actionLoading === v.id ? 0.6 : 1,
                  }}
                >
                  Hide
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
