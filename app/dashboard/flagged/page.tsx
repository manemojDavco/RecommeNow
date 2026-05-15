'use client'

import { useEffect, useState } from 'react'
import type { Vouch } from '@/types'

export default function FlaggedPage() {
  const [vouches, setVouches] = useState<Vouch[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/vouches?status=flagged')
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
        <h1 style={{ fontFamily: 'var(--sans)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.25rem' }}>
          Flagged vouches
        </h1>
        <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
          These vouches received 3+ community flags and were automatically hidden. Review and decide whether to restore or permanently hide them.
        </p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Loading…</p>
      ) : vouches.length === 0 ? (
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, padding: '4rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--sans)', color: 'var(--muted)' }}>No flagged vouches.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {vouches.map((v) => (
            <div
              key={v.id}
              style={{
                background: 'var(--white)',
                border: '1px solid var(--red)',
                borderRadius: 10,
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
                <div>
                  <p style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--ink)' }}>{v.giver_name}</p>
                  <p style={{ fontSize: '.75rem', color: 'var(--muted)' }}>
                    {[v.giver_title, v.giver_company].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <span style={{ background: 'var(--red-l)', color: 'var(--red)', borderRadius: 100, padding: '3px 10px', fontSize: '.7rem', fontWeight: 600 }}>
                  ⚑ {v.flag_count} flag{v.flag_count !== 1 ? 's' : ''}
                </span>
              </div>

              <blockquote style={{ fontFamily: 'var(--sans)', fontSize: '.9rem', lineHeight: 1.65, color: 'var(--ink2)', borderLeft: '3px solid var(--red)', paddingLeft: '1rem', marginBottom: '1rem' }}>
                "{v.quote}"
              </blockquote>

              <div style={{ display: 'flex', gap: '.75rem', paddingTop: '1rem', borderTop: '1px solid var(--rule)' }}>
                <button
                  onClick={() => handleAction(v.id, 'approve')}
                  disabled={actionLoading === v.id}
                  style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 7, padding: '.5rem 1rem', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
                >
                  Restore & approve
                </button>
                <button
                  onClick={() => handleAction(v.id, 'hide')}
                  disabled={actionLoading === v.id}
                  style={{ background: 'var(--white)', color: 'var(--red)', border: '1px solid var(--red)', borderRadius: 7, padding: '.5rem 1rem', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
                >
                  Keep hidden
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
