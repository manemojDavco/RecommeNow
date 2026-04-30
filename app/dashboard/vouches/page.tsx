'use client'

import { useEffect, useState } from 'react'
import type { Vouch } from '@/types'
import Stars from '@/components/Stars'

type Tab = 'all' | 'approved' | 'pending' | 'hidden' | 'flagged'

export default function VouchesPage() {
  const [tab, setTab] = useState<Tab>('all')
  const [vouches, setVouches] = useState<Vouch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const q = tab === 'all' ? '' : `?status=${tab}`
    fetch(`/api/dashboard/vouches${q}`)
      .then((r) => r.json())
      .then((d) => {
        setVouches(d.vouches ?? [])
        setLoading(false)
      })
  }, [tab])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'approved', label: 'Approved' },
    { key: 'pending', label: 'Pending' },
    { key: 'hidden', label: 'Hidden' },
    { key: 'flagged', label: 'Flagged' },
  ]

  return (
    <div style={{ padding: '2rem 2.5rem', flex: 1 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.25rem' }}>
          All vouches
        </h1>
        <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>Manage all vouches across every status.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--rule)', marginBottom: '1.5rem' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '.65rem 1.1rem',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${tab === t.key ? 'var(--green)' : 'transparent'}`,
              color: tab === t.key ? 'var(--green)' : 'var(--muted)',
              fontSize: '.8rem',
              fontWeight: tab === t.key ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'var(--sans)',
              marginBottom: -1,
              transition: 'all .15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Loading…</p>
      ) : vouches.length === 0 ? (
        <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--muted)' }}>No vouches in this category.</p>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--rule)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {vouches.map((v, i) => (
            <div
              key={v.id}
              style={{
                padding: '1.1rem 1.25rem',
                borderBottom: i < vouches.length - 1 ? '1px solid var(--rule)' : 'none',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'var(--green-l)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '.7rem',
                  fontWeight: 700,
                  color: 'var(--green)',
                  flexShrink: 0,
                }}
              >
                {v.giver_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--ink)' }}>{v.giver_name}</span>
                    {v.verified && (
                      <span className="badge-verified" style={{ fontSize: '.58rem' }}>✓ Verified</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                    <Stars rating={v.star_rating} size={11} />
                    <StatusPill status={v.status} />
                  </div>
                </div>
                <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.3rem' }}>
                  {[v.giver_title, v.giver_company, v.giver_relationship].filter(Boolean).join(' · ')}
                </p>
                <p style={{ fontSize: '.8rem', color: 'var(--ink2)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  "{v.quote}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    approved: ['var(--green-l)', 'var(--green2)'],
    pending: ['var(--amber-l)', '#b07010'],
    hidden: ['var(--paper)', 'var(--muted)'],
    flagged: ['var(--red-l)', 'var(--red)'],
  }
  const [bg, color] = map[status] ?? map.pending
  return (
    <span style={{ background: bg, color, borderRadius: 100, padding: '2px 8px', fontSize: '.65rem', fontWeight: 600, textTransform: 'capitalize' }}>
      {status}
    </span>
  )
}
