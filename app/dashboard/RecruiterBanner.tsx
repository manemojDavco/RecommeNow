'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RecruiterBanner() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div style={{
      background: '#1c1917',
      border: '1px solid #3d3833',
      borderRadius: 10,
      padding: '.9rem 1.25rem',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div>
        <p style={{ fontWeight: 700, fontSize: '.85rem', color: '#fff' }}>Recruiter access activated!</p>
        <p style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.5)', marginTop: '.15rem' }}>
          You can now contact candidates directly from the{' '}
          <Link href="/directory" style={{ color: '#86efac', textDecoration: 'none', fontWeight: 600 }}>talent directory</Link> or any public profile.
        </p>
      </div>
      <button
        onClick={() => setVisible(false)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'rgba(255,255,255,.35)', padding: '0 .25rem' }}
      >
        ×
      </button>
    </div>
  )
}
