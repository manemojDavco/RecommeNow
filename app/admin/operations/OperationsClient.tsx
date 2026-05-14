'use client'

import { useEffect, useState } from 'react'

const S = {
  page:    { padding: '36px 40px' } as React.CSSProperties,
  heading: { fontSize: '1.35rem', fontWeight: 800, color: '#1B4332', letterSpacing: '-0.02em', marginBottom: 4 } as React.CSSProperties,
  sub:     { fontSize: '0.82rem', color: '#52705C', marginBottom: 28 } as React.CSSProperties,
  tabs:    { display: 'flex', gap: 4, marginBottom: 24, background: '#E8F5EC', borderRadius: 10, padding: 4, width: 'fit-content' } as React.CSSProperties,
  tab:     (active: boolean): React.CSSProperties => ({ padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: active ? 700 : 500, background: active ? '#2D6A4F' : 'transparent', color: active ? '#F0EAD6' : '#52705C', transition: 'all .15s' }),
  card:    { background: '#fff', border: '1px solid #E0EDE6', borderRadius: 14, overflow: 'hidden', marginBottom: 20 } as React.CSSProperties,
  cardHead:{ padding: '16px 24px', borderBottom: '1px solid #E0EDE6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as React.CSSProperties,
  cardTitle:{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#52B788' },
  th:      { padding: '10px 16px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#52705C', background: '#F6FAF7', borderBottom: '1px solid #E0EDE6', textAlign: 'left' as const },
  td:      { padding: '12px 16px', fontSize: '0.82rem', color: '#1B4332', borderBottom: '1px solid #F0F5F1', verticalAlign: 'middle' as const },
  badge:   (type: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      pro:      { background: '#D8F3DC', color: '#1B4332' },
      free:     { background: '#F0F5F1', color: '#52705C' },
      recruiter:{ background: '#FDF4E7', color: '#92610A' },
    }
    return { ...map[type] ?? map.free, padding: '2px 10px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700, display: 'inline-block' }
  },
  btn:     { padding: '5px 12px', borderRadius: 6, border: '1px solid #D0E9DA', background: '#fff', color: '#2D6A4F', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
  btnDanger:{ padding: '5px 12px', borderRadius: 6, border: '1px solid #fecaca', background: '#fff', color: '#c0392b', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
}

type User = { id: string; user_id: string; name: string; email: string; slug: string; plan: string; recruiter_active: boolean; referral_count: number; created_at: string }
type WaitlistEntry = { id: string; email: string; source: string; created_at: string }

export default function OperationsClient() {
  const [tab, setTab]         = useState<'waitlist' | 'users' | 'vouches'>('waitlist')
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [users, setUsers]     = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast]     = useState<string | null>(null)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  useEffect(() => {
    if (tab === 'waitlist' && waitlist.length === 0) loadWaitlist()
    if (tab === 'users'    && users.length === 0)    loadUsers()
  }, [tab])

  async function loadWaitlist() {
    setLoading(true)
    const res  = await fetch('/api/admin/waitlist')
    const data = await res.json()
    setWaitlist(data.waitlist ?? [])
    setLoading(false)
  }

  async function loadUsers() {
    setLoading(true)
    const res  = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data.users ?? [])
    setLoading(false)
  }

  async function updatePlan(userId: string, plan: string) {
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, plan }) })
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, plan } : u))
    showToast('Plan updated')
  }

  async function toggleRecruiter(userId: string, current: boolean) {
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, recruiter_active: !current }) })
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, recruiter_active: !current } : u))
    showToast('Recruiter status updated')
  }

  async function removeWaitlist(id: string) {
    await fetch('/api/admin/waitlist', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setWaitlist(prev => prev.filter(w => w.id !== id))
    showToast('Removed from waitlist')
  }

  return (
    <div style={S.page}>
      <h1 style={S.heading}>Operations</h1>
      <p style={S.sub}>Manage waitlist, users, and plan assignments.</p>

      {toast && <div style={{ background: '#D8F3DC', color: '#1B4332', padding: '8px 16px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, marginBottom: 20, display: 'inline-block' }}>✓ {toast}</div>}

      <div style={S.tabs}>
        {(['waitlist', 'users'] as const).map(t => (
          <button key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>
            {t === 'waitlist' ? `Waitlist (${waitlist.length || '…'})` : `Users (${users.length || '…'})`}
          </button>
        ))}
      </div>

      {/* Waitlist */}
      {tab === 'waitlist' && (
        <div style={S.card}>
          <div style={S.cardHead}>
            <span style={S.cardTitle}>Waitlist: {waitlist.length} entries</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href="/api/admin/waitlist?format=csv" style={{ ...S.btn, textDecoration: 'none' }}>⬇ Export CSV</a>
              <button
                style={{ ...S.btn, background: '#1B4332', color: '#fff', border: 'none' }}
                onClick={async () => {
                  if (!confirm(`Send launch email to all ${waitlist.length} waitlist users?\n\nEach will receive a "1 month free Pro" offer.`)) return
                  const res = await fetch('/api/admin/send-launch-emails', { method: 'POST' })
                  const data = await res.json()
                  alert(`Done! Sent: ${data.sent}, Failed: ${data.failed ?? 0}, Total: ${data.total}`)
                }}
              >
                Send launch email
              </button>
            </div>
          </div>
          {loading ? <div style={{ padding: 24, color: '#52705C', fontSize: '0.85rem' }}>Loading…</div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={S.th}>Email</th>
                  <th style={S.th}>Source</th>
                  <th style={S.th}>Joined</th>
                  <th style={S.th}></th>
                </tr>
              </thead>
              <tbody>
                {waitlist.length === 0 && <tr><td colSpan={4} style={{ ...S.td, color: '#52705C', textAlign: 'center', padding: 32 }}>No entries yet</td></tr>}
                {waitlist.map(w => (
                  <tr key={w.id}>
                    <td style={S.td}>{w.email}</td>
                    <td style={S.td}><span style={{ ...S.badge('free'), background: '#F0F5F1' }}>{w.source}</span></td>
                    <td style={S.td} title={w.created_at}>{new Date(w.created_at).toLocaleDateString()}</td>
                    <td style={S.td}><button style={S.btnDanger} onClick={() => removeWaitlist(w.id)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div style={S.card}>
          <div style={S.cardHead}>
            <span style={S.cardTitle}>Users: {users.length} total</span>
          </div>
          {loading ? <div style={{ padding: 24, color: '#52705C', fontSize: '0.85rem' }}>Loading…</div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={S.th}>Name</th>
                  <th style={S.th}>Email</th>
                  <th style={S.th}>Plan</th>
                  <th style={S.th}>Recruiter</th>
                  <th style={S.th}>Referrals</th>
                  <th style={S.th}>Joined</th>
                  <th style={S.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && <tr><td colSpan={7} style={{ ...S.td, color: '#52705C', textAlign: 'center', padding: 32 }}>No users yet</td></tr>}
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={S.td}>
                      <a href={`/${u.slug}`} target="_blank" style={{ color: '#2D6A4F', textDecoration: 'none', fontWeight: 600 }}>{u.name || '—'}</a>
                    </td>
                    <td style={{ ...S.td, fontSize: '0.78rem', color: '#52705C' }}>{u.email || '—'}</td>
                    <td style={S.td}><span style={S.badge(u.plan)}>{u.plan}</span></td>
                    <td style={S.td}>
                      <span style={{ ...S.badge(u.recruiter_active ? 'recruiter' : 'free') }}>
                        {u.recruiter_active ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td style={{ ...S.td, textAlign: 'center' as const }}>{u.referral_count}</td>
                    <td style={S.td} title={u.created_at}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {u.plan === 'free'
                          ? <button style={S.btn} onClick={() => updatePlan(u.user_id, 'pro')}>→ Pro</button>
                          : <button style={S.btnDanger} onClick={() => updatePlan(u.user_id, 'free')}>→ Free</button>
                        }
                        <button style={u.recruiter_active ? S.btnDanger : S.btn} onClick={() => toggleRecruiter(u.user_id, u.recruiter_active)}>
                          {u.recruiter_active ? 'Remove Recruiter' : '+ Recruiter'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
