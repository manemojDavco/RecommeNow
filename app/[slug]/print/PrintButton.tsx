'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{ background: '#fff', color: '#1b4332', border: 'none', borderRadius: 7, padding: '.5rem 1.1rem', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Manrope, sans-serif' }}
    >
      Print / Save as PDF
    </button>
  )
}
