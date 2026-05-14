'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

const FAQS = [
  {
    q: 'What is a vouch?',
    a: 'A vouch is a verified endorsement written by someone who has worked with you: a manager, colleague, client, or collaborator. Unlike a generic LinkedIn recommendation, vouches are structured, verified against a real email address, and displayed on your RecommeNow profile so anyone you share it with can see exactly who is vouching for you and why.',
  },
  {
    q: 'How is RecommeNow different from LinkedIn recommendations?',
    a: 'LinkedIn recommendations sit on LinkedIn and disappear into a crowded profile. RecommeNow gives you a standalone, shareable reputation profile you can link in job applications, email signatures, cover letters, or anywhere else. Vouches are email-verified, structured by relationship type, and include specific traits, making them far more credible and actionable than a paragraph buried on a social network.',
  },
  {
    q: 'How does vouch verification work?',
    a: 'When someone submits a vouch for you, we send a verification email to the address they provided. Once they confirm, the vouch is marked as verified. Your profile shows your overall verification rate so viewers instantly know how trustworthy your vouches are. Unverified vouches are still visible but clearly labelled.',
  },
  {
    q: 'Who can see my profile?',
    a: 'Your public profile is visible to anyone you share your link with. It is not indexed by search engines by default. PRO and Recruiter users are also listed in the Talent Directory, which is visible to verified Recruiter accounts.',
  },
  {
    q: 'How do I request a vouch from someone?',
    a: 'From your dashboard, go to "Request Vouch" and copy your unique vouch link. Send it directly to the person via email, WhatsApp, LinkedIn or any channel you like. They can fill in the form in about 2 minutes without creating an account.',
  },
  {
    q: 'Can I remove or flag a vouch?',
    a: 'You can flag any vouch from your dashboard for review if you believe it is inaccurate or inappropriate. Flagged vouches are reviewed by the RecommeNow team. Vouchers can also edit or retract their vouch at any time.',
  },
  {
    q: 'What is the difference between Free, PRO and Recruiter plans?',
    a: 'Free accounts let you collect and display vouches on a public profile. PRO adds a logo badge on your profile and listing in the Talent Directory so recruiters can find you. Recruiter gives you full access to the Directory with AI-powered search and filters to find and contact candidates, ideal for hiring managers and talent acquisition teams.',
  },
  {
    q: 'Is my data private and secure?',
    a: 'Yes. RecommeNow uses industry-standard encryption in transit and at rest. We never sell your data to third parties. You can delete your account and all associated data at any time from your dashboard settings. We are GDPR-compliant and our full Privacy Policy is available on this site.',
  },
  {
    q: 'Do vouchers need to create an account?',
    a: 'No. Anyone can write a vouch for you using just their name, email, and a few minutes of their time. No sign-up required. This removes friction and means you get more vouches.',
  },
  {
    q: 'Can I use RecommeNow if I am not actively job hunting?',
    a: 'Absolutely. Many users build their profile proactively so it is ready when they need it. Your profile is also useful for freelancers, consultants, and founders who want to demonstrate credibility to potential clients or partners, not just employers.',
  },
]

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      style={{
        borderRadius: 14,
        border: '1px solid var(--rule)',
        overflow: 'hidden',
        transition: 'border-color .15s',
        ...(open ? { borderColor: 'var(--green)' } : {}),
      }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '1rem',
          padding: '1.1rem 1.4rem',
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--sans)', fontSize: '.95rem', fontWeight: 600,
          color: 'var(--ink)', textAlign: 'left',
        }}
      >
        {q}
        <span style={{
          flexShrink: 0, width: 26, height: 26, borderRadius: '50%',
          border: '1.5px solid var(--rule)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: open ? 'var(--green)' : 'transparent',
          borderColor: open ? 'var(--green)' : 'var(--rule)',
          transition: 'background .15s, border-color .15s',
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
            style={{ transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>
            <path d="M5 1V9M1 5H9" stroke={open ? '#fff' : 'var(--muted)'} strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </span>
      </button>
      {open && (
        <p style={{
          padding: '0 1.4rem 1.2rem',
          fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65,
          fontFamily: 'var(--sans)',
        }}>
          {a}
        </p>
      )}
    </div>
  )
}

export default function FaqClient() {
  return (
    <>
      <main style={{ minHeight: '80vh', background: 'var(--paper)' }}>
        <div style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '6rem 1.5rem 5rem',
        }}>
          <p style={{
            fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em',
            textTransform: 'uppercase', color: 'var(--green)',
            marginBottom: '1rem', textAlign: 'center',
          }}>
            FAQ
          </p>
          <h1 style={{
            fontSize: 'clamp(1.9rem, 4vw, 2.75rem)',
            fontWeight: 800, color: 'var(--ink)',
            textAlign: 'center', marginBottom: '.75rem', lineHeight: 1.15,
          }}>
            Frequently asked questions
          </h1>
          <p style={{
            fontSize: '.95rem', color: 'var(--muted)', textAlign: 'center',
            marginBottom: '3rem', lineHeight: 1.6,
          }}>
            Everything you need to know about RecommeNow.<br />
            Still have questions? <a href="mailto:hello@recommenow.com" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Drop us a message</a> and we will get back to you.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {FAQS.map(f => <Item key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '2.5rem 2.5rem',
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid var(--rule)',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Brand + social */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
          <Logo variant="dark" href="/" size={22} />
          <a href="https://www.instagram.com/recommenow" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://www.linkedin.com/company/recommenow" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        </div>

        {/* Get the app — hidden until app is ready */}
        <div style={{ display: 'none' }}>
          <div>
            <p style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '.4rem' }}>Get the app</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=72x72&color=1a4231&bgcolor=ffffff&data=${encodeURIComponent('https://recommenow.com')}&qzone=1`}
              alt="Download app QR"
              width={72}
              height={72}
              style={{ borderRadius: 8, border: '1px solid var(--rule)', display: 'block' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            <a href="https://apps.apple.com/app/recommenow" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: '#000', color: '#fff', borderRadius: 7, padding: '.35rem .7rem', textDecoration: 'none', fontSize: '.62rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              App Store
            </a>
            <a href="https://play.google.com/store/apps/recommenow" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: '#000', color: '#fff', borderRadius: 7, padding: '.35rem .7rem', textDecoration: 'none', fontSize: '.62rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.64.24.99.21l12.47-7.2-2.75-2.75-10.71 9.74zM.48 1.61C.18 1.94 0 2.44 0 3.09v17.82c0 .65.18 1.15.49 1.48l.08.07 9.98-9.98v-.24L.56 1.54l-.08.07zM20.12 10.1l-2.83-1.63-3.08 3.08 3.08 3.08 2.85-1.64c.81-.47.81-1.23-.02-1.89zM3.18.24L15.65 7.44l-2.75 2.75L2.19.45c.28-.23.64-.3.99-.21z"/></svg>
              Google Play
            </a>
          </div>
        </div>

        {/* Copyright */}
        <p style={{ fontSize: '.72rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '.6rem' }}>
          © {new Date().getFullYear()} RecommeNow
          <span style={{ opacity: .4 }}>·</span>
          <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy Policy</Link>
          <span style={{ opacity: .4 }}>·</span>
          <Link href="/terms" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Terms of Use</Link>
        </p>
      </footer>
    </>
  )
}
