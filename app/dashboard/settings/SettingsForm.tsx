'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Profile } from '@/types'

const INDUSTRIES = [
  'Accounting & Tax', 'Advertising & Marketing', 'Aerospace & Defence', 'Agriculture & Farming',
  'Architecture & Design', 'Automotive', 'Aviation', 'Banking & Finance', 'Biotechnology',
  'Broadcasting & Media', 'Chemicals & Materials', 'Clean Energy & Renewables', 'Cloud Computing',
  'Computer Hardware', 'Construction & Real Estate', 'Consulting', 'Consumer Goods', 'Cybersecurity',
  'Data & Analytics', 'E-commerce', 'EdTech', 'Electronics & Semiconductors', 'Environmental Services',
  'Events & Entertainment', 'Fashion & Apparel', 'Film & TV Production', 'Fintech', 'Food & Beverage',
  'Gaming & Esports', 'Government & Public Sector', 'Healthcare & Medical', 'HR & Recruitment',
  'Hospitality & Tourism', 'Industrial Manufacturing', 'Information Technology', 'Insurance',
  'Journalism & Publishing', 'Legal Services', 'Logistics & Supply Chain', 'Luxury Goods',
  'Manufacturing', 'Market Research', 'Medical Devices', 'Mining & Resources', 'Mobile & Apps',
  'Music & Audio', 'Non-profit & NGO', 'Oil & Gas', 'Pharmaceuticals', 'Private Equity & VC',
  'PropTech', 'Public Relations', 'Retail', 'SaaS & Software', 'Security Services',
  'Social Impact', 'Sports & Fitness', 'Telecommunications', 'Transportation', 'Travel & Tourism',
  'Utilities & Infrastructure', 'Web3 & Blockchain', 'Wellness & Health',
]

const STAGES = [
  'Sole Trader', 'Start-up', 'Small Business', 'Medium Business',
  'Large Business', 'Enterprise', 'Public Company', 'Non-profit', 'Other',
]

const COUNTRY_CODES = [
  { code: 'AU', name: 'Australia',         dial: '+61' },
  { code: 'AT', name: 'Austria',           dial: '+43' },
  { code: 'BE', name: 'Belgium',           dial: '+32' },
  { code: 'BR', name: 'Brazil',            dial: '+55' },
  { code: 'CA', name: 'Canada',            dial: '+1' },
  { code: 'CN', name: 'China',             dial: '+86' },
  { code: 'HR', name: 'Croatia',           dial: '+385' },
  { code: 'CZ', name: 'Czech Republic',    dial: '+420' },
  { code: 'DK', name: 'Denmark',           dial: '+45' },
  { code: 'EG', name: 'Egypt',             dial: '+20' },
  { code: 'FI', name: 'Finland',           dial: '+358' },
  { code: 'FR', name: 'France',            dial: '+33' },
  { code: 'DE', name: 'Germany',           dial: '+49' },
  { code: 'GR', name: 'Greece',            dial: '+30' },
  { code: 'HK', name: 'Hong Kong',         dial: '+852' },
  { code: 'HU', name: 'Hungary',           dial: '+36' },
  { code: 'IN', name: 'India',             dial: '+91' },
  { code: 'ID', name: 'Indonesia',         dial: '+62' },
  { code: 'IE', name: 'Ireland',           dial: '+353' },
  { code: 'IL', name: 'Israel',            dial: '+972' },
  { code: 'IT', name: 'Italy',             dial: '+39' },
  { code: 'JP', name: 'Japan',             dial: '+81' },
  { code: 'MY', name: 'Malaysia',          dial: '+60' },
  { code: 'MX', name: 'Mexico',            dial: '+52' },
  { code: 'NL', name: 'Netherlands',       dial: '+31' },
  { code: 'NZ', name: 'New Zealand',       dial: '+64' },
  { code: 'NG', name: 'Nigeria',           dial: '+234' },
  { code: 'NO', name: 'Norway',            dial: '+47' },
  { code: 'PH', name: 'Philippines',       dial: '+63' },
  { code: 'PL', name: 'Poland',            dial: '+48' },
  { code: 'PT', name: 'Portugal',          dial: '+351' },
  { code: 'RO', name: 'Romania',           dial: '+40' },
  { code: 'SA', name: 'Saudi Arabia',      dial: '+966' },
  { code: 'RS', name: 'Serbia',            dial: '+381' },
  { code: 'SG', name: 'Singapore',         dial: '+65' },
  { code: 'ZA', name: 'South Africa',      dial: '+27' },
  { code: 'KR', name: 'South Korea',       dial: '+82' },
  { code: 'ES', name: 'Spain',             dial: '+34' },
  { code: 'SE', name: 'Sweden',            dial: '+46' },
  { code: 'CH', name: 'Switzerland',       dial: '+41' },
  { code: 'TW', name: 'Taiwan',            dial: '+886' },
  { code: 'TH', name: 'Thailand',          dial: '+66' },
  { code: 'TR', name: 'Turkey',            dial: '+90' },
  { code: 'UA', name: 'Ukraine',           dial: '+380' },
  { code: 'AE', name: 'UAE',               dial: '+971' },
  { code: 'GB', name: 'United Kingdom',    dial: '+44' },
  { code: 'US', name: 'United States',     dial: '+1' },
  { code: 'VN', name: 'Vietnam',           dial: '+84' },
  { code: 'MK', name: 'North Macedonia',   dial: '+389' },
]

const WORK_PREFS = ['Remote only', 'Hybrid', 'On-site', 'Open to all']

const AVAILABILITY = ['Immediately', '1 week', '2 weeks', '1 month', '2 months', '3 months']

const SLUG_RE = /^[a-z0-9-]{3,40}$/

function IndustryPicker({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const MAX = 10

  const filtered = INDUSTRIES.filter(
    (i) => i.toLowerCase().includes(query.toLowerCase()) && !selected.includes(i)
  )

  function add(ind: string) {
    if (selected.length >= MAX) return
    onChange([...selected, ind])
    setQuery('')
    inputRef.current?.focus()
  }

  function remove(ind: string) { onChange(selected.filter((x) => x !== ind)) }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginBottom: selected.length ? '.5rem' : 0 }}>
        {selected.map((ind) => (
          <span key={ind} style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', background: 'var(--green)', color: '#fff', borderRadius: 100, padding: '3px 10px 3px 12px', fontSize: '.75rem', fontWeight: 600 }}>
            {ind}
            <button onClick={() => remove(ind)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', cursor: 'pointer', fontSize: '.9rem', padding: 0, lineHeight: 1 }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          className="field-input"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={selected.length >= MAX ? `Max ${MAX} selected` : 'Search industries…'}
          disabled={selected.length >= MAX}
          style={{ fontSize: '.85rem' }}
        />
        {open && query.length > 0 && filtered.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1.5px solid var(--rule)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,.08)', zIndex: 50, maxHeight: 220, overflowY: 'auto', marginTop: 2 }}>
            {filtered.slice(0, 20).map((ind) => (
              <button key={ind} onMouseDown={() => add(ind)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '.5rem .9rem', background: 'none', border: 'none', fontSize: '.82rem', color: 'var(--ink)', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                {ind}
              </button>
            ))}
          </div>
        )}
      </div>
      <p style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '.3rem' }}>{selected.length}/{MAX} selected</p>
    </div>
  )
}

export default function SettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter()
  const isRecruiter = profile.recruiter_active
  const isPro = profile.plan === 'pro' || isRecruiter  // Recruiter includes all Pro features
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Parse stored phone (e.g. "+44 7911 123456") into dial code + number
  function parsePhone(stored: string | null): { dialCode: string; number: string } {
    if (!stored) return { dialCode: '+44', number: '' }
    const match = COUNTRY_CODES.find((c) => stored.startsWith(c.dial + ' '))
    if (match) return { dialCode: match.dial, number: stored.slice(match.dial.length + 1) }
    // fallback: treat everything as number
    return { dialCode: '+44', number: stored }
  }
  const parsedPhone = parsePhone(profile.phone ?? null)

  const [form, setForm] = useState({
    title: profile.title ?? '',
    years_experience: profile.years_experience ?? '',
    location: profile.location ?? '',
    remote_preference: profile.remote_preference ?? '',
    availability: profile.availability ?? '',
    bio: profile.bio ?? '',
    industries: profile.industries ?? [],
    stages: profile.stages ?? [],
  })
  const [phoneDialCode, setPhoneDialCode] = useState(parsedPhone.dialCode)
  const [phoneNumber, setPhoneNumber] = useState(parsedPhone.number)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [photoUrl, setPhotoUrl] = useState(profile.photo_url ?? '')
  const [photoStatus, setPhotoStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')

  const [slug, setSlug] = useState(profile.slug)
  const [slugStatus, setSlugStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'conflict'>('idle')
  const [slugError, setSlugError] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelDone, setCancelDone] = useState(false)
  const [downgradeLoading, setDowngradeLoading] = useState(false)

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoStatus('uploading')
    const fd = new FormData()
    fd.append('photo', file)
    const res = await fetch('/api/profile/photo', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) {
      setPhotoUrl(data.url)
      setPhotoStatus('done')
      router.refresh()
      setTimeout(() => setPhotoStatus('idle'), 2500)
    } else {
      setPhotoStatus('error')
    }
  }

  async function save() {
    setStatus('saving')
    const res = await fetch('/api/profile/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        phone: phoneNumber.trim() ? `${phoneDialCode} ${phoneNumber.trim()}` : '',
      }),
    })
    if (res.ok) {
      setStatus('saved')
      router.refresh()
      setTimeout(() => setStatus('idle'), 2000)
    } else {
      setStatus('error')
    }
  }

  async function saveSlug() {
    setSlugStatus('saving')
    setSlugError('')
    if (!SLUG_RE.test(slug)) {
      setSlugError('3–40 lowercase letters, numbers, or hyphens only.')
      setSlugStatus('error')
      return
    }
    const res = await fetch('/api/profile/slug', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) })
    if (res.ok) {
      setSlugStatus('saved')
      router.refresh()
      setTimeout(() => setSlugStatus('idle'), 2000)
    } else {
      const data = await res.json()
      setSlugError(data.error ?? 'Failed to update slug.')
      setSlugStatus(res.status === 409 ? 'conflict' : 'error')
    }
  }

  async function cancelRecruiter() {
    if (!confirm('Cancel your Recruiter plan? You keep directory access until the end of your billing period.')) return
    setCancelLoading(true)
    setPortalError('')
    try {
      const res = await fetch('/api/stripe/cancel-recruiter', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setCancelDone(true)
      } else {
        setPortalError(data.error ?? 'Could not cancel. Please try again.')
      }
    } catch {
      setPortalError('Network error. Please try again.')
    } finally {
      setCancelLoading(false)
    }
  }

  async function downgradeToProAndCancel() {
    if (!confirm('Downgrade to Pro? Your Recruiter access will end at the billing period. You\'ll be taken to checkout for the Pro plan.')) return
    setDowngradeLoading(true)
    setPortalError('')
    try {
      // Cancel recruiter first
      const res = await fetch('/api/stripe/cancel-recruiter', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        setPortalError(data.error ?? 'Could not downgrade. Please try again.')
        setDowngradeLoading(false)
        return
      }
      // Then start Pro checkout
      const checkoutRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: 'usd', planType: 'pro', interval: 'month' }),
      })
      const checkoutData = await checkoutRes.json()
      if (checkoutData.url) {
        window.location.href = checkoutData.url
      } else {
        setCancelDone(true)
        setPortalError('Recruiter plan cancelled. Go to Pricing to add Pro.')
      }
    } catch {
      setPortalError('Network error. Please try again.')
    } finally {
      setDowngradeLoading(false)
    }
  }

  async function openPortal() {
    setPortalLoading(true)
    setPortalError('')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setPortalError(data.error ?? 'Could not open billing portal.')
      }
    } catch {
      setPortalError('Network error. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  const initials = profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{ padding: '2rem 2.5rem', flex: 1 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.25rem' }}>Profile settings</h1>
        <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>This information appears on your public profile.</p>
      </div>

      <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Photo */}
        <div>
          <label className="field-label">Profile photo</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '.5rem' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 72, height: 72, borderRadius: '50%', overflow: 'hidden',
                background: photoUrl ? 'transparent' : 'var(--green)',
                border: '2px dashed var(--rule)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', flexShrink: 0,
              }}
            >
              {photoUrl
                ? <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>{initials}</span>
              }
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity .2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
              >
                <span style={{ color: '#fff', fontSize: '.65rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>Change<br/>photo</span>
              </div>
            </div>
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '.5rem 1rem', borderRadius: 7, border: '1.5px solid var(--rule)', background: '#fff', color: 'var(--ink)', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', marginBottom: '.3rem', display: 'block' }}
              >
                {photoStatus === 'uploading' ? 'Uploading…' : photoStatus === 'done' ? '✓ Photo updated' : 'Upload photo'}
              </button>
              <p style={{ fontSize: '.7rem', color: 'var(--muted)' }}>JPG or PNG, max 5 MB</p>
              {photoStatus === 'error' && <p style={{ fontSize: '.7rem', color: 'var(--red)', marginTop: '.2rem' }}>Upload failed. Try again.</p>}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
          </div>
        </div>

        {/* Slug */}
        <div>
          <label className="field-label">Your profile URL</label>
          {isPro ? (
            <>
              <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '.83rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{appUrl}/</span>
                <input className="field-input" style={{ flex: 1 }} value={slug} onChange={(e) => { setSlug(e.target.value.toLowerCase()); setSlugStatus('idle'); setSlugError('') }} placeholder="your-name" />
                <button onClick={saveSlug} disabled={slugStatus === 'saving' || slug === profile.slug} style={{ padding: '.5rem 1rem', borderRadius: 7, border: 'none', background: slugStatus === 'saved' ? 'var(--green-l)' : 'var(--green)', color: slugStatus === 'saved' ? 'var(--green2)' : '#fff', fontSize: '.78rem', fontWeight: 600, cursor: slugStatus === 'saving' || slug === profile.slug ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)', whiteSpace: 'nowrap', opacity: slug === profile.slug ? 0.5 : 1 }}>
                  {slugStatus === 'saving' ? '…' : slugStatus === 'saved' ? '✓ Saved' : 'Update'}
                </button>
              </div>
              {slugError && <p style={{ fontSize: '.72rem', color: 'var(--red)', marginTop: '.3rem' }}>{slugError}</p>}
            </>
          ) : (
            <>
              <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 8, padding: '.7rem .9rem', fontSize: '.85rem', color: 'var(--muted)' }}>{appUrl}/{profile.slug}</div>
              <p style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '.3rem' }}>Custom slugs available on <Link href="/pricing" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>Pro plan</Link>.</p>
            </>
          )}
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
          <label className="field-label">Mobile number</label>
          <div style={{ display: 'flex', gap: '.5rem', marginTop: '.25rem' }}>
            <select
              value={phoneDialCode}
              onChange={(e) => setPhoneDialCode(e.target.value)}
              className="field-input"
              style={{ width: 'auto', flexShrink: 0, paddingRight: '2rem', fontSize: '.83rem' }}
            >
              {COUNTRY_CODES.sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                <option key={c.code} value={c.dial}>
                  {c.name} ({c.dial})
                </option>
              ))}
            </select>
            <input
              className="field-input"
              style={{ flex: 1 }}
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d\s\-()]/g, ''))}
              placeholder="7911 123456"
            />
          </div>
          <p style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '.3rem' }}>Only visible to you — not shown publicly.</p>
        </div>

        <div>
          <label className="field-label">Working preferences</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.4rem' }}>
            {WORK_PREFS.map((r) => (
              <button key={r} onClick={() => setForm((f) => ({ ...f, remote_preference: f.remote_preference === r ? '' : r }))}
                style={{ padding: '.4rem .85rem', borderRadius: 100, border: `1.5px solid ${form.remote_preference === r ? 'var(--green)' : 'var(--rule)'}`, background: form.remote_preference === r ? 'var(--green-l)' : '#fff', color: form.remote_preference === r ? 'var(--green)' : 'var(--muted)', fontSize: '.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">Availability</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.4rem' }}>
            {AVAILABILITY.map((a) => (
              <button key={a} onClick={() => setForm((f) => ({ ...f, availability: f.availability === a ? '' : a }))}
                style={{ padding: '.4rem .85rem', borderRadius: 100, border: `1.5px solid ${form.availability === a ? 'var(--green)' : 'var(--rule)'}`, background: form.availability === a ? 'var(--green-l)' : '#fff', color: form.availability === a ? 'var(--green)' : 'var(--muted)', fontSize: '.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">Bio</label>
          <textarea className="field-textarea" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="A short bio that appears at the top of your profile…" style={{ minHeight: 100 }} />
        </div>

        <div>
          <label className="field-label">Industries <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(up to 10)</span></label>
          <div style={{ marginTop: '.4rem' }}>
            <IndustryPicker selected={form.industries} onChange={(v) => setForm((f) => ({ ...f, industries: v }))} />
          </div>
        </div>

        <div>
          <label className="field-label">Company types</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.4rem' }}>
            {STAGES.map((s) => (
              <button key={s} onClick={() => setForm((f) => ({ ...f, stages: f.stages.includes(s) ? f.stages.filter((x) => x !== s) : [...f.stages, s] }))}
                style={{ padding: '.4rem .85rem', borderRadius: 100, border: `1.5px solid ${form.stages.includes(s) ? 'var(--green)' : 'var(--rule)'}`, background: form.stages.includes(s) ? 'var(--green-l)' : '#fff', color: form.stages.includes(s) ? 'var(--green)' : 'var(--muted)', fontSize: '.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {status === 'error' && (
          <p style={{ fontSize: '.8rem', color: 'var(--red)', background: 'var(--red-l)', padding: '.6rem .9rem', borderRadius: 7 }}>Failed to save. Please try again.</p>
        )}

        <button onClick={save} disabled={status === 'saving'}
          style={{ background: status === 'saved' ? 'var(--green-l)' : 'var(--green)', color: status === 'saved' ? 'var(--green2)' : '#fff', border: status === 'saved' ? '1px solid var(--green-m)' : 'none', borderRadius: 8, padding: '.8rem 1.5rem', fontSize: '.85rem', fontWeight: 600, cursor: status === 'saving' ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)', alignSelf: 'flex-start', transition: 'all .2s' }}>
          {status === 'saving' ? 'Saving…' : status === 'saved' ? '✓ Saved!' : 'Save changes'}
        </button>

        {/* Billing */}
        <div style={{ borderTop: '1px solid var(--rule)', paddingTop: '1.5rem', marginTop: '.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.75rem' }}>Billing</h2>

          {/* Recruiter plan row — shown instead of Pro row since it includes Pro */}
          {isRecruiter ? (
            <div style={{ border: '1px solid var(--rule)', borderRadius: 10, padding: '1rem 1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: cancelDone ? 0 : '.85rem' }}>
                <div>
                  <p style={{ fontSize: '.82rem', color: 'var(--ink)', fontWeight: 600, marginBottom: '.15rem' }}>Recruiter plan</p>
                  <p style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Directory access · Contact candidates · Includes all Pro features</p>
                </div>
                <button onClick={openPortal} disabled={portalLoading} style={{ padding: '.45rem .9rem', borderRadius: 7, border: '1.5px solid var(--rule)', background: '#fff', color: 'var(--ink)', fontSize: '.75rem', fontWeight: 600, cursor: portalLoading ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {portalLoading ? 'Loading…' : 'Invoices & card →'}
                </button>
              </div>

              {!cancelDone && (
                <div style={{ display: 'flex', gap: '.6rem', paddingTop: '.75rem', borderTop: '1px solid var(--rule)' }}>
                  <button
                    onClick={downgradeToProAndCancel}
                    disabled={downgradeLoading || cancelLoading}
                    style={{ padding: '.45rem .9rem', borderRadius: 7, border: '1.5px solid var(--rule)', background: '#fff', color: 'var(--ink)', fontSize: '.75rem', fontWeight: 600, cursor: downgradeLoading || cancelLoading ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)', opacity: downgradeLoading || cancelLoading ? 0.6 : 1 }}
                  >
                    {downgradeLoading ? 'Processing…' : 'Downgrade to Pro'}
                  </button>
                  <button
                    onClick={cancelRecruiter}
                    disabled={cancelLoading || downgradeLoading}
                    style={{ padding: '.45rem .9rem', borderRadius: 7, border: '1.5px solid var(--red)', background: 'var(--red-l)', color: 'var(--red)', fontSize: '.75rem', fontWeight: 600, cursor: cancelLoading || downgradeLoading ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)', opacity: cancelLoading || downgradeLoading ? 0.6 : 1 }}
                  >
                    {cancelLoading ? 'Cancelling…' : 'Cancel plan'}
                  </button>
                </div>
              )}

              {cancelDone && (
                <p style={{ fontSize: '.78rem', color: 'var(--green2)', background: 'var(--green-l)', padding: '.5rem .8rem', borderRadius: 7, marginTop: '.75rem' }}>
                  Your Recruiter plan is set to cancel at the end of the billing period. You keep full access until then.
                </p>
              )}
            </div>
          ) : isPro ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '.82rem', color: 'var(--ink)', fontWeight: 600 }}>Pro plan</p>
                <p style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Unlimited vouches · Custom slug</p>
              </div>
              <button onClick={openPortal} disabled={portalLoading} style={{ padding: '.5rem 1rem', borderRadius: 7, border: '1.5px solid var(--rule)', background: '#fff', color: 'var(--ink)', fontSize: '.78rem', fontWeight: 600, cursor: portalLoading ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)' }}>
                {portalLoading ? 'Loading…' : 'Manage billing →'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '.82rem', color: 'var(--ink)', fontWeight: 600 }}>Free plan</p>
                <p style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Up to 10 approved vouches</p>
              </div>
              <Link href="/pricing" style={{ padding: '.5rem 1rem', borderRadius: 7, border: 'none', background: 'var(--green)', color: '#fff', fontSize: '.78rem', fontWeight: 600, textDecoration: 'none' }}>Upgrade to Pro →</Link>
            </div>
          )}

          {portalError && (
            <p style={{ fontSize: '.75rem', color: 'var(--red)', background: 'var(--red-l)', padding: '.5rem .8rem', borderRadius: 7, marginTop: '.75rem' }}>{portalError}</p>
          )}

          <p style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '.6rem', lineHeight: 1.5 }}>
            Cancellations take effect at the end of your billing period — you keep access until then.
          </p>
        </div>
      </div>
    </div>
  )
}
