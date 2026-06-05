'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function QrModal({ slug, name }: { slug: string; name: string }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle')

  const profileUrl = `https://recommenow.com/${slug}`
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=1a4231&bgcolor=ffffff&data=${encodeURIComponent(profileUrl)}&qzone=1`

  useEffect(() => { setMounted(true) }, [])

  async function copyQr() {
    setCopyStatus('copying')
    try {
      const res = await fetch(qrSrc)
      const blob = await res.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 2500)
    } catch {
      // Fallback: copy the URL instead
      try {
        await navigator.clipboard.writeText(profileUrl)
        setCopyStatus('copied')
        setTimeout(() => setCopyStatus('idle'), 2500)
      } catch {
        setCopyStatus('error')
        setTimeout(() => setCopyStatus('idle'), 2500)
      }
    }
  }

  const modal = open ? (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20,
          padding: '2rem', maxWidth: 320, width: '90%',
          textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,.22)',
        }}
      >
        <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.1em', color: 'var(--green2)', marginBottom: '.5rem', textTransform: 'uppercase' }}>
          {name}&apos;s profile
        </p>
        <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Scan to view {name}&apos;s public profile.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrSrc}
          alt="QR code"
          width={200}
          height={200}
          style={{ borderRadius: 12, border: '1px solid var(--rule)' }}
        />
        <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '1rem', wordBreak: 'break-all' }}>
          {profileUrl}
        </p>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '.6rem', marginTop: '1.25rem' }}>
          <button
            onClick={copyQr}
            disabled={copyStatus === 'copying'}
            style={{
              flex: 1, padding: '.7rem',
              background: copyStatus === 'copied' ? 'var(--green-l)' : '#fff',
              color: copyStatus === 'copied' ? 'var(--green2)' : 'var(--ink)',
              border: `1.5px solid ${copyStatus === 'copied' ? 'var(--green-m)' : 'var(--rule)'}`,
              borderRadius: 10, fontSize: '.82rem', fontWeight: 600,
              cursor: copyStatus === 'copying' ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--sans)', transition: 'all .2s',
            }}
          >
            {copyStatus === 'copying' ? 'Copying…' : copyStatus === 'copied' ? '✓ QR Code Copied!' : copyStatus === 'error' ? 'Failed' : 'Share QR'}
          </button>
          <button
            onClick={() => setOpen(false)}
            style={{
              flex: 1, padding: '.7rem',
              background: 'var(--green)', color: '#fff', border: 'none',
              borderRadius: 10, fontSize: '.82rem', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--sans)',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '.4rem',
          background: 'none', border: '1px solid var(--rule)',
          borderRadius: 8, padding: '.45rem .85rem',
          fontSize: '.78rem', fontWeight: 600, color: 'var(--ink2)',
          cursor: 'pointer', fontFamily: 'var(--sans)',
          transition: 'border-color .15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--green)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--rule)')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
          <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/>
        </svg>
        QR Code
      </button>

      {mounted && createPortal(modal, document.body)}
    </>
  )
}
