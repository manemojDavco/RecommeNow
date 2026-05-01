'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

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

const WORK_PREFS = ['Remote only', 'Hybrid', 'On-site', 'Open to all']

const AVAILABILITY = ['Immediately', '1 week', '2 weeks', '1 month', '2 months', '3 months', 'Custom']

type Step = 1 | 2 | 3

function IndustryPicker({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (v: string[]) => void
}) {
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

  function remove(ind: string) {
    onChange(selected.filter((x) => x !== ind))
  }

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
              <button
                key={ind}
                onMouseDown={() => add(ind)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '.5rem .9rem', background: 'none', border: 'none', fontSize: '.82rem', color: 'var(--ink)', cursor: 'pointer', fontFamily: 'var(--sans)' }}
              >
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

export default function OnboardingWizard() {
  const router = useRouter()
  const { user } = useUser()
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState({
    name: user?.fullName ?? '',
    title: '',
    years_experience: '',
    location: '',
    remote_preference: '',
    availability: '',
    bio: '',
    industries: [] as string[],
    stages: [] as string[],
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function toggleArr(key: 'stages', val: string) {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val],
    }))
  }

  function canAdvance() {
    if (step === 1) return form.name.trim().length >= 2
    return true
  }

  async function finish() {
    setStatus('loading')
    setErrorMsg('')
    const refMatch = document.cookie.match(/(?:^|;\s*)ref=([^;]+)/)
    const referral_code = refMatch ? refMatch[1] : undefined
    const res = await fetch('/api/profile/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, ...(referral_code ? { referral_code } : {}) }),
    })
    const json = await res.json()
    if (!res.ok) {
      setErrorMsg(json.error ?? 'Something went wrong.')
      setStatus('error')
      return
    }
    router.push('/dashboard')
  }

  const stepLabels = ['Your basics', 'Your background', 'Industries & work style']

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 420px',
        height: '100vh',
        fontFamily: 'var(--sans)',
        overflow: 'hidden',
      }}
    >
      {/* ── LEFT — form ── */}
      <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.4rem 3rem',
            borderBottom: '1px solid var(--rule)',
            flexShrink: 0,
            background: '#fff',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Link href="/" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--muted)', textDecoration: 'none' }}>
            Recomme<span style={{ color: 'var(--ink)' }}>Now</span>
          </Link>

          {/* Step dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {stepLabels.map((label, i) => {
              const n = i + 1
              const done = step > n
              const active = step === n
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <div
                      style={{
                        width: 24, height: 24, borderRadius: '50%',
                        border: `1.5px solid ${active ? 'var(--green)' : done ? 'var(--green)' : 'var(--rule)'}`,
                        background: active ? 'var(--green)' : done ? 'var(--green)' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '.62rem', fontWeight: 700,
                        color: active || done ? '#fff' : 'var(--muted)',
                        flexShrink: 0, transition: 'all .3s',
                      }}
                    >
                      {done ? '✓' : n}
                    </div>
                    <span style={{ fontSize: '.72rem', fontWeight: active ? 600 : 400, color: active ? 'var(--ink)' : 'var(--muted)' }}>
                      {label}
                    </span>
                  </div>
                  {i < 2 && <div style={{ width: 24, height: 1, background: 'var(--rule)', margin: '0 .3rem' }} />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form content */}
        <div style={{ flex: 1, padding: '3rem', maxWidth: 520 }}>
          {/* ── STEP 1: Basics ── */}
          {step === 1 && (
            <div className="animate-fade-up">
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.7rem', fontWeight: 400, color: 'var(--ink)', marginBottom: '.5rem' }}>
                Let's build your profile
              </h1>
              <p style={{ fontSize: '.88rem', color: 'var(--muted)', marginBottom: '2.5rem', fontWeight: 300, lineHeight: 1.7 }}>
                Start with your name and current role. This is the first thing people see.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="field-label">Full name *</label>
                  <input className="field-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nick Baker" style={{ fontSize: '1rem' }} />
                </div>
                <div>
                  <label className="field-label">Current role / title</label>
                  <input className="field-input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Head of Product" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="field-label">Years of experience</label>
                    <input className="field-input" type="number" min="0" max="50" value={form.years_experience} onChange={(e) => setForm((f) => ({ ...f, years_experience: e.target.value }))} placeholder="8" />
                  </div>
                  <div>
                    <label className="field-label">Location</label>
                    <input className="field-input" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="London, UK" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Background ── */}
          {step === 2 && (
            <div className="animate-fade-up">
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.7rem', fontWeight: 400, color: 'var(--ink)', marginBottom: '.5rem' }}>
                Tell your story
              </h1>
              <p style={{ fontSize: '.88rem', color: 'var(--muted)', marginBottom: '2.5rem', fontWeight: 300, lineHeight: 1.7 }}>
                A short bio and your working preferences help people understand your background.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label className="field-label">Working preferences</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.4rem' }}>
                    {WORK_PREFS.map((r) => (
                      <button
                        key={r}
                        onClick={() => setForm((f) => ({ ...f, remote_preference: f.remote_preference === r ? '' : r }))}
                        style={{
                          padding: '.45rem .9rem', borderRadius: 100,
                          border: `1.5px solid ${form.remote_preference === r ? 'var(--green)' : 'var(--rule)'}`,
                          background: form.remote_preference === r ? 'var(--green-l)' : '#fff',
                          color: form.remote_preference === r ? 'var(--green)' : 'var(--muted)',
                          fontSize: '.78rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)', transition: 'all .15s',
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="field-label">Availability</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.4rem' }}>
                    {AVAILABILITY.map((a) => (
                      <button
                        key={a}
                        onClick={() => setForm((f) => ({ ...f, availability: f.availability === a ? '' : a }))}
                        style={{
                          padding: '.45rem .9rem', borderRadius: 100,
                          border: `1.5px solid ${form.availability === a ? 'var(--green)' : 'var(--rule)'}`,
                          background: form.availability === a ? 'var(--green-l)' : '#fff',
                          color: form.availability === a ? 'var(--green)' : 'var(--muted)',
                          fontSize: '.78rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)', transition: 'all .15s',
                        }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="field-label">Bio</label>
                  <textarea
                    className="field-textarea"
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Experienced product leader with a track record of shipping B2B SaaS products from 0 to 1 and scaling them to enterprise…"
                    style={{ minHeight: 120 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Industries & stages ── */}
          {step === 3 && (
            <div className="animate-fade-up">
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.7rem', fontWeight: 400, color: 'var(--ink)', marginBottom: '.5rem' }}>
                Your expertise
              </h1>
              <p style={{ fontSize: '.88rem', color: 'var(--muted)', marginBottom: '2.5rem', fontWeight: 300, lineHeight: 1.7 }}>
                Select the industries and company types you've worked in. Helps recruiters find the right fit.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <label className="field-label">Industries <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(up to 10)</span></label>
                  <div style={{ marginTop: '.5rem' }}>
                    <IndustryPicker selected={form.industries} onChange={(v) => setForm((f) => ({ ...f, industries: v }))} />
                  </div>
                </div>

                <div>
                  <label className="field-label">Company types</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.5rem' }}>
                    {STAGES.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleArr('stages', s)}
                        style={{
                          padding: '.45rem .9rem', borderRadius: 100,
                          border: `1.5px solid ${form.stages.includes(s) ? 'var(--green)' : 'var(--rule)'}`,
                          background: form.stages.includes(s) ? 'var(--green)' : '#fff',
                          color: form.stages.includes(s) ? '#fff' : 'var(--muted)',
                          fontSize: '.78rem', fontWeight: form.stages.includes(s) ? 600 : 400,
                          cursor: 'pointer', fontFamily: 'var(--sans)', transition: 'all .15s',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {errorMsg && (
                <p style={{ fontSize: '.8rem', color: 'var(--red)', background: 'var(--red-l)', padding: '.6rem .9rem', borderRadius: 7, marginTop: '1.5rem' }}>
                  {errorMsg}
                </p>
              )}
            </div>
          )}

          {/* Nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem' }}>
            {step > 1
              ? <button onClick={() => setStep((s) => (s - 1) as Step)} className="btn-secondary">← Back</button>
              : <div />
            }
            {step < 3
              ? <button onClick={() => setStep((s) => (s + 1) as Step)} disabled={!canAdvance()} className="btn-primary" style={{ opacity: canAdvance() ? 1 : 0.4, fontSize: '.88rem', padding: '.8rem 1.8rem' }}>Continue →</button>
              : <button onClick={finish} disabled={status === 'loading'} className="btn-primary" style={{ fontSize: '.88rem', padding: '.8rem 1.8rem' }}>{status === 'loading' ? 'Creating…' : 'Create my profile →'}</button>
            }
          </div>
        </div>
      </div>

      {/* ── RIGHT — preview ── */}
      <div style={{ background: 'var(--paper)', borderLeft: '1px solid var(--rule)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--rule)', flexShrink: 0 }}>
          <p style={{ fontSize: '.65rem', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>Live preview</p>
        </div>

        <div style={{ padding: '1.5rem', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 700, fontSize: '1.1rem', color: '#fff', flexShrink: 0 }}>
              {form.name ? form.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '?'}
            </div>
            <div>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' }}>{form.name || 'Your name'}</p>
              <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: 2 }}>{form.title || 'Your title'}{form.years_experience && ` · ${form.years_experience} yrs`}</p>
            </div>
          </div>

          {form.location && (
            <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.4rem' }}>📍 {form.location} {form.remote_preference && `· ${form.remote_preference}`}</p>
          )}
          {form.availability && (
            <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.75rem' }}>⏱ Available: {form.availability}</p>
          )}

          {form.bio && (
            <p style={{ fontSize: '.82rem', fontWeight: 300, lineHeight: 1.7, color: 'var(--ink2)', marginBottom: '1rem' }}>{form.bio}</p>
          )}

          {(form.industries.length > 0 || form.stages.length > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem', marginBottom: '1.25rem' }}>
              {[...form.industries, ...form.stages].map((tag) => (
                <span key={tag} style={{ background: '#fff', border: '1px solid var(--rule)', borderRadius: 100, padding: '2px 8px', fontSize: '.68rem', color: 'var(--muted)', fontWeight: 500 }}>{tag}</span>
              ))}
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid var(--rule)', margin: '1.25rem 0' }} />

          <div style={{ background: '#fff', border: '1px solid var(--rule)', borderRadius: 10, padding: '1rem', opacity: 0.5 }}>
            <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green2)', marginBottom: '.6rem' }}>● Former manager</p>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '.82rem', lineHeight: 1.65, color: 'var(--ink2)', marginBottom: '.75rem' }}>"Your first vouch will appear here once a colleague verifies their email."</p>
            <div style={{ display: 'flex', gap: 2, color: 'var(--amber)', fontSize: '1rem' }}>
              {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
