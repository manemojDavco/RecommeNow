'use client'

import { useState } from 'react'

type Props = {
  industries: string[]
  stages: string[]
}

export default function TagsSection({ industries, stages }: Props) {
  const [open, setOpen] = useState<'industries' | 'stages' | null>(null)

  if (!industries.length && !stages.length) return null

  const items = open === 'industries' ? industries : stages
  const title = open === 'industries' ? 'Industries' : 'Company types'

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '1rem' }}>
        {industries.length > 0 && (
          <button
            onClick={() => setOpen('industries')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '.35rem',
              background: 'var(--paper)',
              border: '1px solid var(--rule)',
              borderRadius: 100,
              padding: '5px 12px',
              fontSize: '.75rem',
              fontWeight: 600,
              color: 'var(--ink)',
              cursor: 'pointer',
              fontFamily: 'var(--sans)',
            }}
          >
            Industries
            <span style={{
              background: 'var(--green)',
              color: '#fff',
              borderRadius: 100,
              fontSize: '.62rem',
              fontWeight: 700,
              padding: '1px 6px',
              lineHeight: 1.6,
            }}>
              {industries.length}
            </span>
          </button>
        )}
        {stages.length > 0 && (
          <button
            onClick={() => setOpen('stages')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '.35rem',
              background: 'var(--paper)',
              border: '1px solid var(--rule)',
              borderRadius: 100,
              padding: '5px 12px',
              fontSize: '.75rem',
              fontWeight: 600,
              color: 'var(--ink)',
              cursor: 'pointer',
              fontFamily: 'var(--sans)',
            }}
          >
            Company types
            <span style={{
              background: 'var(--green)',
              color: '#fff',
              borderRadius: 100,
              fontSize: '.62rem',
              fontWeight: 700,
              padding: '1px 6px',
              lineHeight: 1.6,
            }}>
              {stages.length}
            </span>
          </button>
        )}
      </div>

      {open && (
        <div
          onClick={() => setOpen(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.45)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '18px 18px 0 0',
              padding: '1.5rem 1.5rem 2.5rem',
              width: '100%',
              maxWidth: 520,
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--sans)', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)' }}>
                {title}
                <span style={{ fontWeight: 400, color: 'var(--muted)', marginLeft: '.4rem', fontSize: '.85rem' }}>
                  ({items.length})
                </span>
              </h3>
              <button
                onClick={() => setOpen(null)}
                style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--rule)',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  color: 'var(--muted)',
                  fontFamily: 'var(--sans)',
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
              {items.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: 'var(--paper)',
                    border: '1px solid var(--rule)',
                    borderRadius: 100,
                    padding: '5px 12px',
                    fontSize: '.78rem',
                    color: 'var(--muted)',
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
