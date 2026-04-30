'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types'

const INDUSTRIES = ['B2B SaaS', 'Fintech', 'Healthtech', 'E-commerce', 'Media', 'Agency', 'Consulting', 'Marketplace', 'Deep tech', 'Climate', 'EdTech', 'Web3']
const STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B+', 'Growth', 'Enterprise', 'Bootstrapped', 'Non-profit']
const REMOTE = ['Remote only', 'Hybrid', 'On-site', 'Open to all']

export default function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: profile.title ?? '',
    years_experience: profile.years_experience ?? '',
    location: profile.location ?? '',
    remote_preference: profile.remote_preference ?? '',
    bio: profile.bio ?? '',
    industries: profile.industries ?? [],
    stages: profile.stages ?? [],
  })
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  function toggleArr(key: 'industries' | 'stages', val: string) {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val],
    }))
  }

  async function save() {
    setStatus('saving')
    const res = await fetch('/api/profile/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setStatus('saved')
      router.refresh()
      setTimeout(() => setStatus('idle'), 2000)
    } else {
      setStatus('error')
    }
  }

  return (
    <div style={{ padding: '2rem 2.5rem', flex: 1 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.25rem' }}>
          Profile settings
        </h1>
        <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
          This information appears on your public profile.
        </p>
      </div>

      <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Slug (read-only) */}
        <div>
          <label className="field-label">Your profile URL</label>
          <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 8, padding: '.7rem .9rem', fontSize: '.85rem', color: 'var(--muted)' }}>
            {process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'}/{profile.slug}
          </div>
          <p style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '.3rem' }}>Custom slugs available on Pro plan.</p>
        </div>

        <div>
          <label className="field-label">Job title</label>
          <input className="field-input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Head of Product" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="field-label">Years of experience</label>
            <input className="field-input" value={form.years_experience} onChange={(e) => setForm((f) => ({ ...f, years_experience: e.target.value }))} placeholder="8" />
          </div>
          <div>
            <label className="field-label">Location</label>
            <input className="field-input" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="London, UK" />
          </div>
        </div>

        <div>
          <label className="field-label">Remote preference</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.4rem' }}>
            {REMOTE.map((r) => (
              <button
                key={r}
                onClick={() => setForm((f) => ({ ...f, remote_preference: f.remote_preference === r ? '' : r }))}
                style={{
                  padding: '.4rem .85rem',
                  borderRadius: 100,
                  border: `1.5px solid ${form.remote_preference === r ? 'var(--green)' : 'var(--rule)'}`,
                  background: form.remote_preference === r ? 'var(--green-l)' : 'var(--white)',
                  color: form.remote_preference === r ? 'var(--green)' : 'var(--muted)',
                  fontSize: '.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">Bio</label>
          <textarea className="field-textarea" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="A short bio that appears at the top of your profile..." style={{ minHeight: 100 }} />
        </div>

        <div>
          <label className="field-label">Industries</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.4rem' }}>
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                onClick={() => toggleArr('industries', ind)}
                style={{
                  padding: '.4rem .85rem',
                  borderRadius: 100,
                  border: `1.5px solid ${form.industries.includes(ind) ? 'var(--green)' : 'var(--rule)'}`,
                  background: form.industries.includes(ind) ? 'var(--green-l)' : 'var(--white)',
                  color: form.industries.includes(ind) ? 'var(--green)' : 'var(--muted)',
                  fontSize: '.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                }}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">Company stages</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.4rem' }}>
            {STAGES.map((s) => (
              <button
                key={s}
                onClick={() => toggleArr('stages', s)}
                style={{
                  padding: '.4rem .85rem',
                  borderRadius: 100,
                  border: `1.5px solid ${form.stages.includes(s) ? 'var(--green)' : 'var(--rule)'}`,
                  background: form.stages.includes(s) ? 'var(--green-l)' : 'var(--white)',
                  color: form.stages.includes(s) ? 'var(--green)' : 'var(--muted)',
                  fontSize: '.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {status === 'error' && (
          <p style={{ fontSize: '.8rem', color: 'var(--red)', background: 'var(--red-l)', padding: '.6rem .9rem', borderRadius: 7 }}>
            Failed to save. Please try again.
          </p>
        )}

        <button
          onClick={save}
          disabled={status === 'saving'}
          style={{
            background: status === 'saved' ? 'var(--green-l)' : 'var(--green)',
            color: status === 'saved' ? 'var(--green2)' : '#fff',
            border: status === 'saved' ? '1px solid var(--green-m)' : 'none',
            borderRadius: 8,
            padding: '.8rem 1.5rem',
            fontSize: '.85rem',
            fontWeight: 600,
            cursor: status === 'saving' ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--sans)',
            alignSelf: 'flex-start',
            transition: 'all .2s',
          }}
        >
          {status === 'saving' ? 'Saving…' : status === 'saved' ? '✓ Saved!' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
