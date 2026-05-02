'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RecruiterDirectoryCard() {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  function open() {
    const q = query.trim()
    router.push(q ? `/directory?q=${encodeURIComponent(q)}` : '/directory')
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') open()
  }

  return (
    <div style={{ background: 'var(--ink)', borderRadius: 12, padding: '.9rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ flexShrink: 0 }}>
        <p style={{ fontSize: '.62rem', fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.15rem' }}>Recruiter access</p>
        <p style={{ fontSize: '.82rem', fontWeight: 600, color: '#fff' }}>Browse the talent directory</p>
      </div>

      {/* AI search input */}
      <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
        <span style={{ position: 'absolute', left: '.6rem', top: '50%', transform: 'translateY(-50%)', fontSize: '.7rem', color: 'rgba(255,255,255,.35)', pointerEvents: 'none' }}>✦</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKey}
          placeholder="e.g. senior product manager in fintech, remote"
          style={{
            width: '100%',
            background: 'rgba(255,255,255,.07)',
            border: query ? '1px solid rgba(255,255,255,.3)' : '1px solid rgba(255,255,255,.12)',
            borderRadius: 8,
            padding: '.45rem .75rem .45rem 1.75rem',
            fontSize: '.75rem',
            color: '#fff',
            outline: 'none',
            fontFamily: 'var(--sans)',
          }}
        />
      </div>

      <button
        onClick={open}
        style={{
          background: 'rgba(255,255,255,.1)',
          border: '1px solid rgba(255,255,255,.2)',
          borderRadius: 8,
          padding: '.5rem 1rem',
          fontSize: '.75rem',
          fontWeight: 600,
          color: '#fff',
          cursor: 'pointer',
          fontFamily: 'var(--sans)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Open Directory →
      </button>
    </div>
  )
}
