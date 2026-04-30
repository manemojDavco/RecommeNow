'use client'

import { useState } from 'react'

export default function UpgradedBanner() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div style={{
      background: 'var(--green-l)',
      border: '1px solid var(--green-m)',
      borderRadius: 10,
      padding: '.9rem 1.25rem',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div>
        <p style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--green2)' }}>Welcome to Pro!</p>
        <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: '.15rem' }}>
          Unlimited vouches and custom slug are now active. Set your slug in Settings.
        </p>
      </div>
      <button
        onClick={() => setVisible(false)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--muted)', padding: '0 .25rem' }}
      >
        ×
      </button>
    </div>
  )
}
