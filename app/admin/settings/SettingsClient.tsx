'use client'

import { useState } from 'react'

const S = {
  page:      { padding: '36px 40px' } as React.CSSProperties,
  heading:   { fontSize: '1.35rem', fontWeight: 800, color: '#1B4332', letterSpacing: '-0.02em', marginBottom: 4 } as React.CSSProperties,
  sub:       { fontSize: '0.82rem', color: '#52705C', marginBottom: 32 } as React.CSSProperties,
  card:      { background: '#fff', border: '1px solid #E0EDE6', borderRadius: 14, padding: '24px 28px', marginBottom: 20 } as React.CSSProperties,
  cardTitle: { fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#52B788', marginBottom: 20 },
  row:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F0F5F1' } as React.CSSProperties,
  rowLabel:  { fontWeight: 600, fontSize: '0.88rem', color: '#1B4332' } as React.CSSProperties,
  rowSub:    { fontSize: '0.75rem', color: '#52705C', marginTop: 2 } as React.CSSProperties,
  btn:       { padding: '9px 20px', borderRadius: 8, border: 'none', background: '#2D6A4F', color: '#F0EAD6', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' } as React.CSSProperties,
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
      background: value ? '#2D6A4F' : '#D0E9DA', position: 'relative', transition: 'background .2s', flexShrink: 0,
    }}>
      <span style={{ position: 'absolute', top: 3, left: value ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
    </button>
  )
}

const FEATURES = [
  { key: 'feature_directory',  label: 'Recruiter Directory', sub: 'Public /directory page visible to all visitors' },
  { key: 'feature_recruiter',  label: 'Recruiter Plan',      sub: 'Allow users to subscribe to the recruiter tier' },
  { key: 'feature_pro_plan',   label: 'Pro Plan',            sub: 'Allow users to subscribe to the Pro tier' },
  { key: 'maintenance_mode',   label: 'Maintenance Mode',    sub: 'Shows a maintenance message to all non-admin visitors' },
]

export default function SettingsClient({ settings }: { settings: Record<string, string> }) {
  const [s, setS]   = useState({ ...settings })
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500) }

  async function toggle(key: string, val: boolean) {
    const value = val ? 'true' : 'false'
    setS(prev => ({ ...prev, [key]: value }))
    await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) })
    showToast(`${key.replace(/_/g, ' ')} ${val ? 'enabled' : 'disabled'}`)
  }

  return (
    <div style={S.page}>
      <h1 style={S.heading}>Site Settings</h1>
      <p style={S.sub}>Toggle features and control site behaviour.</p>

      {toast && <div style={{ background: '#D8F3DC', color: '#1B4332', padding: '8px 16px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, marginBottom: 20, display: 'inline-block' }}>✓ {toast}</div>}

      <div style={S.card}>
        <div style={S.cardTitle}>Feature Flags</div>
        {FEATURES.map(({ key, label, sub }, i) => (
          <div key={key} style={{ ...S.row, borderBottom: i === FEATURES.length - 1 ? 'none' : '1px solid #F0F5F1' }}>
            <div>
              <div style={S.rowLabel}>{label}</div>
              <div style={S.rowSub}>{sub}</div>
            </div>
            <Toggle value={s[key] === 'true'} onChange={v => toggle(key, v)} />
          </div>
        ))}
      </div>

      <div style={{ ...S.card, background: '#FFF8F0', border: '1px solid #FDEBD0' }}>
        <div style={{ ...S.cardTitle, color: '#B7770D' }}>Danger Zone</div>
        <div style={{ fontSize: '0.85rem', color: '#92610A', lineHeight: 1.6, marginBottom: 16 }}>
          To reset the database or manage Stripe subscriptions, use the Supabase or Stripe dashboards directly.
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="https://supabase.com/dashboard/project/obmbsgstfdmoqmtzvjfk" target="_blank" rel="noopener"
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #FDEBD0', background: '#fff', color: '#92610A', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
            Open Supabase ↗
          </a>
          <a href="https://dashboard.stripe.com" target="_blank" rel="noopener"
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #FDEBD0', background: '#fff', color: '#92610A', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
            Open Stripe ↗
          </a>
          <a href="https://vercel.com/manemojdavcos-projects/recommenow" target="_blank" rel="noopener"
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #FDEBD0', background: '#fff', color: '#92610A', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
            Open Vercel ↗
          </a>
        </div>
      </div>
    </div>
  )
}
