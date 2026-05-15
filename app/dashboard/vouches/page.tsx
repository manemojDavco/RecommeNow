'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import type { Vouch } from '@/types'

type Tab = 'all' | 'approved' | 'pending' | 'hidden' | 'flagged' | 'given'

type GivenVouch = {
  id: string
  profile_id: string
  profile_name: string
  profile_slug: string
  quote: string
  traits: string[]
  giver_relationship: string | null
  verified: boolean
  created_at: string
}

export default function VouchesPage() {
  const [tab, setTab] = useState<Tab>('all')
  const [vouches, setVouches] = useState<Vouch[]>([])
  const [loading, setLoading] = useState(true)
  const [givenVouches, setGivenVouches] = useState<GivenVouch[]>([])
  const [givenLoading, setGivenLoading] = useState(true)
  const [localVouches, setLocalVouches] = useState<Vouch[]>([])
  const dragItem = useRef<number | null>(null)
  const dragOver = useRef<number | null>(null)

  useEffect(() => {
    if (tab === 'given') return
    setLoading(true)
    const q = tab === 'all' ? '' : `?status=${tab}`
    fetch(`/api/dashboard/vouches${q}`)
      .then((r) => r.json())
      .then((d) => {
        const list = d.vouches ?? []
        setVouches(list)
        setLocalVouches(list)
        setLoading(false)
      })
  }, [tab])

  useEffect(() => {
    fetch('/api/dashboard/given-vouches')
      .then((r) => r.json())
      .then((d) => {
        setGivenVouches(d.vouches ?? [])
        setGivenLoading(false)
      })
      .catch(() => setGivenLoading(false))
  }, [])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'approved', label: 'Approved' },
    { key: 'pending', label: 'Pending' },
    { key: 'hidden', label: 'Hidden' },
    { key: 'flagged', label: 'Flagged' },
    { key: 'given', label: 'Given' },
  ]

  // ── Drag-and-drop (approved tab only) ──
  function handleDragStart(index: number) {
    dragItem.current = index
  }

  function handleDragEnter(index: number) {
    if (dragItem.current === null || dragItem.current === index) return
    const from = dragItem.current
    dragItem.current = index   // update synchronously so rapid events don't double-fire
    setLocalVouches((prev) => {
      const updated = [...prev]
      const dragged = updated.splice(from, 1)[0]
      updated.splice(index, 0, dragged)
      return updated
    })
  }

  async function handleDragEnd() {
    dragItem.current = null
    dragOver.current = null
    // Auto-save new order
    await fetch('/api/dashboard/vouches/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: localVouches.map((v) => v.id) }),
    })
  }

  const isApprovedTab = tab === 'approved'
  const displayVouches = isApprovedTab ? localVouches : vouches
  const showDragHint = isApprovedTab && displayVouches.length > 1

  return (
    <div style={{ padding: '2rem 2.5rem', flex: 1 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--sans)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.25rem' }}>
          All vouches
        </h1>
        <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>Manage all vouches across every status.</p>
      </div>

      {/* Tabs */}
      <div className="rn-vouches-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--rule)', marginBottom: '1.5rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' as const }}>
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

      {/* ── GIVEN TAB ── */}
      {tab === 'given' && (
        <>
          {givenLoading ? (
            <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Loading…</p>
          ) : givenVouches.length === 0 ? (
            <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, padding: '2.5rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--sans)', color: 'var(--muted)', fontSize: '.9rem' }}>You haven&apos;t given any vouches yet.</p>
              <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: '.5rem' }}>When you vouch for someone on their profile page, it will appear here.</p>
            </div>
          ) : (
            <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, overflow: 'hidden' }}>
              {givenVouches.map((v, i) => (
                <div
                  key={v.id}
                  style={{
                    padding: '1.1rem 1.25rem',
                    borderBottom: i < givenVouches.length - 1 ? '1px solid var(--rule)' : 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'var(--paper)',
                    border: '1px solid var(--rule)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.7rem', fontWeight: 700, color: 'var(--muted)', flexShrink: 0,
                  }}>
                    {v.profile_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <Link href={`/${v.profile_slug}`} target="_blank" style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--green)', textDecoration: 'none' }}>
                          {v.profile_name} ↗
                        </Link>
                        {v.verified && <span className="badge-verified" style={{ fontSize: '.58rem' }}>✓ Verified</span>}
                      </div>
                      {v.giver_relationship && (
                        <span style={{ fontSize: '.68rem', color: 'var(--green2)', fontWeight: 600 }}>{v.giver_relationship}</span>
                      )}
                    </div>
                    <p style={{ fontSize: '.8rem', color: 'var(--ink2)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      &ldquo;{v.quote}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── RECEIVED VOUCHES (all tabs except given) ── */}
      {tab !== 'given' && (
        <>
          {showDragHint && (
            <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.35rem' }}>
              <span style={{ fontSize: '.9rem' }}>⠿</span> Drag vouches to reorder how they appear on your public profile. Changes save automatically.
            </p>
          )}

          {loading ? (
            <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Loading…</p>
          ) : displayVouches.length === 0 ? (
            <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, padding: '3rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--sans)', color: 'var(--muted)' }}>No vouches in this category.</p>
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
              {displayVouches.map((v, i) => (
                <div
                  key={v.id}
                  draggable={isApprovedTab}
                  onDragStart={isApprovedTab ? () => handleDragStart(i) : undefined}
                  onDragEnter={isApprovedTab ? () => handleDragEnter(i) : undefined}
                  onDragOver={isApprovedTab ? (e) => e.preventDefault() : undefined}
                  onDragEnd={isApprovedTab ? handleDragEnd : undefined}
                  style={{
                    padding: '1.1rem 1.25rem',
                    borderBottom: i < displayVouches.length - 1 ? '1px solid var(--rule)' : 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    cursor: isApprovedTab ? 'grab' : 'default',
                    userSelect: isApprovedTab ? 'none' : 'auto',
                  }}
                >
                  {isApprovedTab && (
                    <span style={{ fontSize: '1rem', color: 'var(--muted)', flexShrink: 0, alignSelf: 'center', cursor: 'grab' }}>⠿</span>
                  )}
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
                      <StatusPill status={v.status} />
                    </div>
                    <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.3rem' }}>
                      {[v.giver_title, v.giver_company, v.giver_relationship].filter(Boolean).join(' · ')}
                    </p>
                    <p style={{ fontSize: '.8rem', color: 'var(--ink2)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      &ldquo;{v.quote}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
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
