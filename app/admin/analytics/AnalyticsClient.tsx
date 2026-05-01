'use client'

import { useEffect, useState } from 'react'

type Stats = {
  totalUsers: number; proUsers: number; recruiterUsers: number
  totalVouches: number; approvedVouches: number; flaggedVouches: number
  newUsersWeek: number; waitlistCount: number
}

function StatCard({ label, value, sub, color }: { label: string; value: number | null; sub?: string; color?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E0EDE6', borderRadius: 14, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#95D5B2' }}>{label}</div>
      <div style={{ fontSize: '2.4rem', fontWeight: 800, color: color ?? '#1B4332', lineHeight: 1, letterSpacing: '-0.03em' }}>
        {value === null ? '…' : value.toLocaleString()}
      </div>
      {sub && <div style={{ fontSize: '0.75rem', color: '#52705C' }}>{sub}</div>}
    </div>
  )
}

export default function AnalyticsClient() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics').then(r => r.json()).then(d => { setStats(d); setLoading(false) })
  }, [])

  const s = stats

  return (
    <div style={{ padding: '36px 40px', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1B4332', letterSpacing: '-0.02em', marginBottom: 4 }}>Analytics</h1>
      <p style={{ fontSize: '0.82rem', color: '#52705C', marginBottom: 32 }}>Live snapshot from the database.</p>

      {/* Users */}
      <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2D6A4F', marginBottom: 12 }}>Users</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Users"      value={loading ? null : s?.totalUsers ?? 0}    sub="All time" />
        <StatCard label="New This Week"    value={loading ? null : s?.newUsersWeek ?? 0}  sub="Last 7 days" color="#2D6A4F" />
        <StatCard label="Pro Plan"         value={loading ? null : s?.proUsers ?? 0}       sub="Paying candidates" color="#52B788" />
        <StatCard label="Recruiters"       value={loading ? null : s?.recruiterUsers ?? 0} sub="Active recruiter plan" color="#e8a020" />
      </div>

      {/* Vouches */}
      <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2D6A4F', marginBottom: 12 }}>Vouches</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Vouches"    value={loading ? null : s?.totalVouches ?? 0}    sub="All submitted" />
        <StatCard label="Approved"         value={loading ? null : s?.approvedVouches ?? 0}  sub="Visible on profiles" color="#2D6A4F" />
        <StatCard label="Flagged"          value={loading ? null : s?.flaggedVouches ?? 0}   sub="Needs review" color="#c0392b" />
      </div>

      {/* Waitlist */}
      <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2D6A4F', marginBottom: 12 }}>Waitlist</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        <StatCard label="Waitlist Signups" value={loading ? null : s?.waitlistCount ?? 0}  sub="Emails captured" color="#2D6A4F" />
      </div>
    </div>
  )
}
