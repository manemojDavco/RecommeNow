import Link from 'next/link'
import { Logo } from '@/components/Logo'

// Shared site footer — brand + social, Get the app (App Store + QR), legal links.
// Used across marketing/auth pages so the footer is identical everywhere.
export default function SiteFooter() {
  return (
    <footer
      style={{
        padding: '2.5rem 2.5rem',
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid var(--rule)',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      {/* Brand + social icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
        <Logo variant="dark" href="/" size={22} />
        <style>{`
          .footer-social-ig { color: var(--muted); display: flex; align-items: center; transition: color .15s; }
          .footer-social-ig:hover { color: #e1306c; }
          .footer-social-li { color: var(--muted); display: flex; align-items: center; transition: color .15s; }
          .footer-social-li:hover { color: #0a66c2; }
        `}</style>
        <a
          href="https://www.instagram.com/recommenow"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="footer-social-ig"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
        <a
          href="https://www.linkedin.com/company/recommenow"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="footer-social-li"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
      </div>

      {/* Get the app — App Store link + QR */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/app-store-qr.png"
          alt="Scan to download RecommeNow on the App Store"
          width={72}
          height={72}
          style={{ borderRadius: 8, border: '1px solid var(--rule)', display: 'block' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
          <p style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase', margin: 0 }}>Get the app</p>
          <a
            href="https://apps.apple.com/app/id6769583849"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download RecommeNow on the App Store"
            style={{
              display: 'flex', alignItems: 'center', gap: '.5rem',
              background: '#000', color: '#fff', borderRadius: 9,
              padding: '.5rem .85rem', textDecoration: 'none',
              fontSize: '.72rem', fontWeight: 600, whiteSpace: 'nowrap',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: '.55rem', fontWeight: 500, opacity: .85 }}>Download on the</span>
              <span style={{ fontSize: '.82rem', fontWeight: 700 }}>App Store</span>
            </span>
          </a>
        </div>
      </div>

      <p style={{ fontSize: '.72rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
        © {new Date().getFullYear()} RecommeNow
        <span style={{ opacity: .4 }}>·</span>
        <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy Policy</Link>
        <span style={{ opacity: .4 }}>·</span>
        <Link href="/terms" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Terms of Use</Link>
      </p>
    </footer>
  )
}
