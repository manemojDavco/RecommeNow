'use client'

import { useState, useEffect, ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  name: string
  linkedinUrl?: string | null
  phone?: string | null
  email?: string | null
  children: ReactNode
}

export default function ContactInfoButton({ name, linkedinUrl, phone, email, children }: Props) {
  const [showContact, setShowContact] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const modal = showContact && mounted ? createPortal(
    <div
      onClick={() => setShowContact(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: '2rem',
          maxWidth: 340,
          width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--sans)', fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
            Contact info
          </h3>
          <button
            onClick={() => setShowContact(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--muted)', padding: '0 .2rem', lineHeight: 1 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <div>
            <p style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.2rem' }}>Name</p>
            <p style={{ fontSize: '.88rem', color: 'var(--ink)', fontWeight: 500 }}>{name}</p>
          </div>

          {linkedinUrl && (
            <div>
              <p style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.2rem' }}>LinkedIn</p>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '.85rem', color: '#0a66c2', fontWeight: 600, textDecoration: 'none', wordBreak: 'break-all' }}
              >
                {linkedinUrl}
              </a>
            </div>
          )}

          {phone && (
            <div>
              <p style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.2rem' }}>Phone</p>
              <a href={`tel:${phone.replace(/\s/g, '')}`} style={{ fontSize: '.88rem', color: 'var(--ink)', fontWeight: 500, textDecoration: 'none' }}>
                {phone}
              </a>
            </div>
          )}

          {email && (
            <div>
              <p style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.2rem' }}>Email</p>
              <a href={`mailto:${email}`} style={{ fontSize: '.88rem', color: 'var(--ink)', fontWeight: 500, textDecoration: 'none', wordBreak: 'break-all' }}>
                {email}
              </a>
            </div>
          )}
        </div>

        <p style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--rule)', lineHeight: 1.5 }}>
          Contact info is provided by the profile owner.
        </p>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <>
      <div style={{ position: 'relative', width: 72, flexShrink: 0 }}>
        {children}
        {/* Curved "info" label hugging the bottom of the avatar circle */}
        <button
          onClick={() => setShowContact(true)}
          style={{
            position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'block',
          }}
          aria-label="Show contact info"
        >
          {/* Arc: M 4,20 A 60,60 0 0,0 76,20 curves upward through (40,8) — verified midpoint inside viewBox */}
          <svg viewBox="0 0 80 22" width="72" height="24" xmlns="http://www.w3.org/2000/svg" overflow="visible">
            <defs>
              <path id="rn-info-arc" d="M 4,20 A 60,60 0 0,0 76,20" />
            </defs>
            <text
              fontSize="13"
              fill="#2D6A4F"
              textAnchor="middle"
              fontFamily="var(--sans)"
              fontWeight="700"
              letterSpacing="2"
            >
              <textPath href="#rn-info-arc" startOffset="50%">info</textPath>
            </text>
          </svg>
        </button>
      </div>
      {modal}
    </>
  )
}
