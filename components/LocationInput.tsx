'use client'

import { useState, useRef, useEffect } from 'react'

type Suggestion = { id: string; label: string }

type Props = {
  value: string
  onChange: (text: string) => void
  placeholder?: string
  className?: string
}

function formatPlace(item: any): string {
  const a = item.address ?? {}
  const city =
    a.city ?? a.town ?? a.village ?? a.municipality ??
    a.county ?? item.name ?? ''
  const state = a.state ?? ''
  const country = a.country ?? ''
  const parts = [city, state, country].filter(Boolean)
  return parts.filter((p, i) => p !== parts[i - 1]).join(', ')
}

export default function LocationInput({
  value, onChange, placeholder = 'e.g. London, UK', className = 'field-input',
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const selectedRef = useRef(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedRef.current) { selectedRef.current = false; return }
    if (!value || value.trim().length < 2) { setSuggestions([]); setOpen(false); return }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(value)}`
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
        const data = await res.json()
        const items: Suggestion[] = (Array.isArray(data) ? data : [])
          .map((it: any) => ({ id: String(it.place_id), label: formatPlace(it) }))
          .filter((s) => s.label)
        setSuggestions(items)
        setOpen(items.length > 0)
      } catch { setSuggestions([]); setOpen(false) }
      finally { setLoading(false) }
    }, 300)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [value])

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [])

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        className={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && (
        <div
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: 'var(--white)', border: '1px solid var(--rule)',
            borderRadius: 8, marginTop: 4, maxHeight: 240, overflowY: 'auto',
            boxShadow: '0 8px 24px rgba(0,0,0,.08)',
          }}
        >
          {loading && (
            <div style={{ padding: '0.6rem 0.8rem', fontSize: '.85rem', color: 'var(--muted)' }}>
              Searching…
            </div>
          )}
          {!loading && suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { selectedRef.current = true; onChange(s.label); setOpen(false) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '0.6rem 0.8rem', border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: '.9rem', color: 'var(--ink)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--cream)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
