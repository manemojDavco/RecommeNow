'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

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
const REMOTE_OPTIONS = ['Remote only', 'Hybrid', 'On-site', 'Open to all']

type DirectoryProfile = {
  id: string
  slug: string
  name: string
  title: string | null
  bio: string | null
  location: string | null
  remote_preference: string | null
  industries: string[]
  vouch_count: number
  trust_score: number
  verification_rate: number
  top_quote: string | null
}

function ProfileCard({ p }: { p: DirectoryProfile }) {
  const initials = p.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const summary = p.bio || p.top_quote || null

  return (
    <Link href={`/${p.slug}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: 'var(--white)',
          border: '1px solid var(--rule)',
          borderRadius: 12,
          padding: '1.25rem 1.4rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          cursor: 'pointer',
          transition: 'border-color .15s, box-shadow .15s',
          alignItems: 'center',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--green)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,.06)'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--rule)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
        }}
      >
        {/* LEFT: profile info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--green-l)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 700,
              fontSize: '.9rem', color: 'var(--green)', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
              {p.title && <p style={{ fontSize: '.75rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</p>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '.6rem' }}>
            <div style={{ flex: 1, background: 'var(--paper)', borderRadius: 7, padding: '.45rem .6rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '1rem', fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>{p.vouch_count}</p>
              <p style={{ fontSize: '.6rem', color: 'var(--muted)', marginTop: '.1rem' }}>vouches</p>
            </div>
            <div style={{ flex: 1, background: 'var(--paper)', borderRadius: 7, padding: '.45rem .6rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{p.verification_rate}%</p>
              <p style={{ fontSize: '.6rem', color: 'var(--muted)', marginTop: '.1rem' }}>verified</p>
            </div>
          </div>

          {(p.location || p.remote_preference) && (
            <p style={{ fontSize: '.72rem', color: 'var(--muted)' }}>
              📍 {[p.location, p.remote_preference].filter(Boolean).join(' · ')}
            </p>
          )}

          {p.industries?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem' }}>
              {p.industries.slice(0, 3).map((ind) => (
                <span key={ind} style={{ background: 'var(--green-l)', color: 'var(--green2)', borderRadius: 100, padding: '.2rem .6rem', fontSize: '.62rem', fontWeight: 600 }}>{ind}</span>
              ))}
              {p.industries.length > 3 && (
                <span style={{ fontSize: '.62rem', color: 'var(--muted)', alignSelf: 'center' }}>+{p.industries.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: vouch summary */}
        <div style={{ borderLeft: '1px solid var(--rule)', paddingLeft: '1.5rem', minWidth: 0 }}>
          {summary ? (
            <>
              <p style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green2)', marginBottom: '.5rem' }}>
                {p.bio ? 'About' : 'From their vouches'}
              </p>
              <p style={{
                fontFamily: p.top_quote && !p.bio ? 'var(--serif)' : 'var(--sans)',
                fontStyle: p.top_quote && !p.bio ? 'italic' : 'normal',
                fontSize: '.85rem',
                lineHeight: 1.65,
                color: 'var(--ink2)',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
              }}>
                {p.top_quote && !p.bio ? `"${summary}"` : summary}
              </p>
            </>
          ) : (
            <p style={{ fontSize: '.82rem', color: 'var(--muted)', fontStyle: 'italic' }}>
              View profile to read their vouches →
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function DirectoryClient({ initial }: { initial: DirectoryProfile[] }) {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''

  const [profiles, setProfiles] = useState<DirectoryProfile[]>(initial)

  // AI search state
  const [aiQuery, setAiQuery] = useState(initialQ)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiActive, setAiActive] = useState(false)
  const [aiFiltersDesc, setAiFiltersDesc] = useState('')
  const aiInputRef = useRef<HTMLInputElement>(null)

  // Manual search state
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('')
  const [remote, setRemote] = useState('')
  const [location, setLocation] = useState('')
  const [sort, setSort] = useState('vouches')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(initial.length === 24)

  // Run AI search if initial query is present (from URL)
  useEffect(() => {
    if (initialQ) {
      runAiSearch(initialQ)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runAiSearch(q: string) {
    if (!q.trim()) {
      setAiActive(false)
      setAiFiltersDesc('')
      return
    }
    setAiLoading(true)
    setAiActive(true)
    try {
      const res = await fetch('/api/directory/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()
      setProfiles(data.profiles ?? [])
      setHasMore(false)

      // Build a short description of what AI found
      const f = data.filters ?? {}
      const parts: string[] = []
      if (f.keywords) parts.push(`"${f.keywords}"`)
      if (f.industries?.length) parts.push(f.industries.join(', '))
      if (f.location) parts.push(f.location)
      if (f.remote_preference) parts.push(f.remote_preference)
      setAiFiltersDesc(parts.join(' · '))
    } catch {
      setAiActive(false)
    } finally {
      setAiLoading(false)
    }
  }

  function clearAiSearch() {
    setAiQuery('')
    setAiActive(false)
    setAiFiltersDesc('')
    setPage(0)
    fetch_({ search, industry, remote, location, sort, page: 0, replace: true })
    aiInputRef.current?.focus()
  }

  const fetch_ = useCallback(async (opts: { search: string; industry: string; remote: string; location: string; sort: string; page: number; replace: boolean }) => {
    setLoading(true)
    const params = new URLSearchParams({
      search: opts.search,
      industry: opts.industry,
      remote: opts.remote,
      location: opts.location,
      sort: opts.sort,
      page: String(opts.page),
    })
    const res = await fetch(`/api/directory?${params}`)
    const data = await res.json()
    const items: DirectoryProfile[] = data.profiles ?? []
    setProfiles((prev) => opts.replace ? items : [...prev, ...items])
    setHasMore(items.length === 24)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (aiActive) return
    setPage(0)
    fetch_({ search, industry, remote, location, sort, page: 0, replace: true })
  }, [search, industry, remote, location, sort, fetch_, aiActive])

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetch_({ search, industry, remote, location, sort, page: next, replace: false })
  }

  return (
    <div style={{ fontFamily: 'var(--sans)' }}>

      {/* ── ROW 1: AI smart search ── */}
      <div style={{ marginBottom: '.75rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          border: `1.5px solid ${aiActive ? 'var(--green)' : 'var(--rule)'}`,
          borderRadius: 10,
          boxShadow: aiActive ? '0 0 0 3px var(--green-l)' : 'none',
          transition: 'border-color .2s, box-shadow .2s',
          overflow: 'hidden',
        }}>
          <span style={{ padding: '0 .9rem', fontSize: '1rem', opacity: .5, flexShrink: 0 }}>✦</span>
          <input
            ref={aiInputRef}
            type="text"
            placeholder="Describe who you're looking for… e.g. Senior engineering leader with 5+ years in SaaS"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') runAiSearch(aiQuery) }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '.85rem .5rem .85rem 0',
              fontSize: '.85rem',
              fontFamily: 'var(--sans)',
              color: 'var(--ink)',
              background: 'transparent',
            }}
          />
          {aiQuery && (
            <button onClick={clearAiSearch} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '0 .6rem', fontSize: '1rem', flexShrink: 0 }}>✕</button>
          )}
          <button
            onClick={() => runAiSearch(aiQuery)}
            disabled={aiLoading || !aiQuery.trim()}
            style={{
              background: aiLoading || !aiQuery.trim() ? 'var(--paper)' : 'var(--green)',
              color: aiLoading || !aiQuery.trim() ? 'var(--muted)' : '#fff',
              border: 'none',
              borderLeft: '1px solid var(--rule)',
              padding: '.85rem 1.3rem',
              fontSize: '.78rem',
              fontWeight: 700,
              cursor: aiLoading || !aiQuery.trim() ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--sans)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'background .15s, color .15s',
            }}
          >
            {aiLoading ? 'Searching…' : 'AI Search'}
          </button>
        </div>

        {/* AI result description */}
        {aiActive && !aiLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginTop: '.5rem', padding: '0 .4rem' }}>
            <span style={{ fontSize: '.72rem', color: 'var(--green)', fontWeight: 600 }}>✦ AI matched:</span>
            <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{aiFiltersDesc || 'all profiles'}</span>
            <button onClick={clearAiSearch} style={{ fontSize: '.7rem', color: 'var(--muted)', background: 'none', border: '1px solid var(--rule)', borderRadius: 100, padding: '.15rem .6rem', cursor: 'pointer', fontFamily: 'var(--sans)', marginLeft: '.25rem' }}>
              Clear · show all
            </button>
          </div>
        )}
      </div>

      {/* ── ROW 2: Manual filters ── */}
      <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginBottom: '1.75rem', alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Search by name or title…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setAiActive(false) }}
          className="field-input"
          style={{ flex: '1 1 200px', minWidth: 0, fontSize: '.82rem' }}
        />

        <select
          value={industry}
          onChange={(e) => { setIndustry(e.target.value); setAiActive(false) }}
          className="field-input"
          style={{ flex: '0 1 170px', fontSize: '.82rem' }}
        >
          <option value="">All industries</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>

        <input
          type="search"
          placeholder="City or country…"
          value={location}
          onChange={(e) => { setLocation(e.target.value); setAiActive(false) }}
          className="field-input"
          style={{ flex: '0 1 150px', fontSize: '.82rem' }}
        />

        <select
          value={remote}
          onChange={(e) => { setRemote(e.target.value); setAiActive(false) }}
          className="field-input"
          style={{ flex: '0 1 150px', fontSize: '.82rem' }}
        >
          <option value="">Any work style</option>
          {REMOTE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

      </div>

      {/* ── Sort bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1rem', padding: '.6rem .9rem', background: 'var(--paper)', borderRadius: 8, border: '1px solid var(--rule)' }}>
        <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase', flexShrink: 0 }}>Sort by</span>
        {[
          { value: 'vouches', label: 'Most vouches' },
          { value: 'verified', label: 'Most verified' },
          { value: 'name', label: 'Name' },
          { value: 'location', label: 'Location' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setSort(opt.value); setAiActive(false) }}
            style={{
              padding: '.3rem .75rem',
              borderRadius: 100,
              border: `1.5px solid ${sort === opt.value ? 'var(--green)' : 'var(--rule)'}`,
              background: sort === opt.value ? 'var(--green-l)' : 'var(--white)',
              color: sort === opt.value ? 'var(--green)' : 'var(--muted)',
              fontSize: '.75rem',
              fontWeight: sort === opt.value ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'var(--sans)',
              transition: 'all .15s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {profiles.length === 0 && !loading && !aiLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--muted)', fontSize: '1rem', marginBottom: '.5rem' }}>No profiles match your search.</p>
          {aiActive && (
            <button onClick={clearAiSearch} style={{ fontSize: '.8rem', color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)', textDecoration: 'underline' }}>
              Clear AI search and show all
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '2rem' }}>
            {(loading || aiLoading)
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ background: 'var(--paper)', borderRadius: 12, padding: '1.25rem 1.4rem', height: 110, animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))
              : profiles.map((p) => <ProfileCard key={p.id} p={p} />)
            }
          </div>

          {hasMore && !aiActive && (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={loadMore}
                disabled={loading}
                style={{
                  background: 'var(--white)', border: '1.5px solid var(--rule)',
                  borderRadius: 8, padding: '.7rem 1.8rem',
                  fontSize: '.82rem', fontWeight: 600, color: 'var(--ink)',
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
