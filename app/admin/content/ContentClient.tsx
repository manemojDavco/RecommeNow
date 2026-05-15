'use client'

import { useState } from 'react'

const S = {
  page:    { padding: '36px 40px' } as React.CSSProperties,
  heading: { fontSize: '1.35rem', fontWeight: 800, color: '#1B4332', letterSpacing: '-0.02em', marginBottom: 4 } as React.CSSProperties,
  sub:     { fontSize: '0.82rem', color: '#52705C', marginBottom: 32 } as React.CSSProperties,
  card:    { background: '#fff', border: '1px solid #E0EDE6', borderRadius: 14, padding: '28px 28px', marginBottom: 20 } as React.CSSProperties,
  cardTitle: { fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#52B788', marginBottom: 18 },
  label:   { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#1B4332', marginBottom: 6 } as React.CSSProperties,
  input:   { width: '100%', padding: '10px 14px', border: '1.5px solid #D0E9DA', borderRadius: 8, fontSize: '0.88rem', color: '#1B4332', outline: 'none', fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' as const },
  row:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 } as React.CSSProperties,
  btn:     { padding: '9px 20px', borderRadius: 8, border: 'none', background: '#2D6A4F', color: '#F0EAD6', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'background .15s' } as React.CSSProperties,
  toast:   { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, marginLeft: 12 } as React.CSSProperties,
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
      background: value ? '#2D6A4F' : '#D0E9DA', position: 'relative', transition: 'background .2s',
      flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 3, left: value ? 25 : 3, width: 20, height: 20,
        borderRadius: '50%', background: '#fff', transition: 'left .2s',
        boxShadow: '0 1px 4px rgba(0,0,0,.2)',
      }} />
    </button>
  )
}

function FieldRow({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={S.label}>{label}</label>
      <input style={S.input} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

export default function ContentClient({ settings }: { settings: Record<string, string> }) {
  const [s, setS]       = useState({ ...settings })
  const [saving, setSaving]   = useState<string | null>(null)
  const [toast, setToast]     = useState<string | null>(null)
  const [deploying, setDeploying] = useState(false)

  function update(key: string, value: string) {
    setS(prev => ({ ...prev, [key]: value }))
  }

  async function save(keys: string[], section: string) {
    setSaving(section)
    await Promise.all(keys.map(k =>
      fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: k, value: s[k] }) })
    ))
    setSaving(null)
    setToast(`${section} saved`)
    setTimeout(() => setToast(null), 2500)
  }

  async function toggleComingSoon(val: boolean) {
    update('coming_soon', val ? 'true' : 'false')
    setDeploying(true)
    await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'coming_soon', value: val ? 'true' : 'false' }) })
    await fetch('/api/admin/deploy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comingSoon: val }) })
    setDeploying(false)
    setToast(val ? 'Coming Soon enabled. Redeploying…' : 'Site is now LIVE. Redeploying…')
    setTimeout(() => setToast(null), 5000)
  }

  const comingSoon = s['coming_soon'] === 'true'

  return (
    <div style={S.page}>
      <h1 style={S.heading}>Content Management</h1>
      <p style={S.sub}>Edit live content and toggle the coming soon page.</p>

      {toast && (
        <div style={{ ...S.toast, background: '#D8F3DC', color: '#1B4332', marginBottom: 20, marginLeft: 0 }}>
          ✓ {toast}
        </div>
      )}

      {/* Coming Soon Toggle */}
      <div style={S.card}>
        <div style={S.cardTitle}>Site Status</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1B4332', marginBottom: 4 }}>Coming Soon Mode</div>
            <div style={{ fontSize: '0.8rem', color: '#52705C' }}>
              {comingSoon
                ? '🔒 Site is in coming-soon mode. Only the waitlist page is visible.'
                : '🌐 Site is live. All pages are publicly accessible.'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: comingSoon ? '#e8a020' : '#2D6A4F' }}>
              {deploying ? '⏳ Deploying…' : comingSoon ? 'Coming Soon' : 'Live'}
            </span>
            <Toggle value={comingSoon} onChange={toggleComingSoon} />
          </div>
        </div>
      </div>

      {/* Coming Soon Page Content */}
      <div style={S.card}>
        <div style={S.cardTitle}>Coming Soon Page</div>
        <FieldRow label="Headline line 1" value={s['hero_headline_1'] ?? ''} onChange={v => update('hero_headline_1', v)} placeholder="Don't just apply." />
        <FieldRow label="Headline line 2" value={s['hero_headline_2'] ?? ''} onChange={v => update('hero_headline_2', v)} placeholder="Get vouched." />
        <FieldRow label="Sub-text" value={s['hero_sub'] ?? ''} onChange={v => update('hero_sub', v)} placeholder="Verified peer endorsements..." />
        <FieldRow label="Tagline (bold line)" value={s['hero_tagline'] ?? ''} onChange={v => update('hero_tagline', v)} placeholder="The vouch that opens the door." />
        <button
          style={{ ...S.btn, opacity: saving === 'coming-soon-content' ? 0.6 : 1 }}
          onClick={() => save(['hero_headline_1','hero_headline_2','hero_sub','hero_tagline'], 'coming-soon-content')}
          disabled={saving === 'coming-soon-content'}
        >
          {saving === 'coming-soon-content' ? 'Saving…' : 'Save changes'}
        </button>
        <span style={{ fontSize: '0.75rem', color: '#52705C', marginLeft: 12 }}>
          Changes take effect on next page load.
        </span>
      </div>

      {/* Announcement Banner */}
      <div style={S.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={S.cardTitle}>Announcement Banner</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.78rem', color: '#52705C' }}>{s['announcement_enabled'] === 'true' ? 'Visible' : 'Hidden'}</span>
            <Toggle
              value={s['announcement_enabled'] === 'true'}
              onChange={v => { update('announcement_enabled', v ? 'true' : 'false'); save(['announcement_enabled'], 'banner-toggle') }}
            />
          </div>
        </div>
        <FieldRow label="Banner message" value={s['announcement_text'] ?? ''} onChange={v => update('announcement_text', v)} placeholder="🎉 We just launched Pro plan! Check it out →" />
        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Colour</label>
          <select value={s['announcement_color'] ?? 'green'} onChange={e => update('announcement_color', e.target.value)}
            style={{ ...S.input, width: 'auto', paddingRight: 32 }}>
            <option value="green">Green</option>
            <option value="amber">Amber</option>
            <option value="blue">Blue</option>
          </select>
        </div>
        <button style={{ ...S.btn, opacity: saving === 'banner' ? 0.6 : 1 }}
          onClick={() => save(['announcement_text','announcement_color','announcement_enabled'], 'banner')}
          disabled={saving === 'banner'}>
          {saving === 'banner' ? 'Saving…' : 'Save banner'}
        </button>
      </div>
    </div>
  )
}
