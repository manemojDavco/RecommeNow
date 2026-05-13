'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'What is a vouch?',
    a: 'A vouch is a verified endorsement written by someone who has worked with you — a manager, colleague, client, or collaborator. Unlike a generic LinkedIn recommendation, vouches are structured, verified against a real email address, and displayed on your RecommeNow profile so anyone you share it with can see exactly who is vouching for you and why.',
  },
  {
    q: 'How is RecommeNow different from LinkedIn recommendations?',
    a: 'LinkedIn recommendations sit on LinkedIn and disappear into a crowded profile. RecommeNow gives you a standalone, shareable reputation profile you can link in job applications, email signatures, cover letters, or anywhere else. Vouches are email-verified, structured by relationship type, and include specific traits — making them far more credible and actionable than a paragraph buried on a social network.',
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
    a: 'From your dashboard, go to "Request Vouch" and copy your unique vouch link. Send it directly to the person via email, WhatsApp, LinkedIn — any channel you like. They can fill in the form in about 2 minutes without creating an account.',
  },
  {
    q: 'Can I remove or flag a vouch?',
    a: 'You can flag any vouch from your dashboard for review if you believe it is inaccurate or inappropriate. Flagged vouches are reviewed by the RecommeNow team. Vouchers can also edit or retract their vouch at any time.',
  },
  {
    q: 'What is the difference between Free, PRO and Recruiter plans?',
    a: 'Free accounts let you collect and display vouches on a public profile. PRO adds a logo badge on your profile and listing in the Talent Directory so recruiters can find you. Recruiter gives you full access to the Directory with AI-powered search and filters to find and contact candidates — ideal for hiring managers and talent acquisition teams.',
  },
  {
    q: 'Is my data private and secure?',
    a: 'Yes. RecommeNow uses industry-standard encryption in transit and at rest. We never sell your data to third parties. You can delete your account and all associated data at any time from your dashboard settings. We are GDPR-compliant and our full Privacy Policy is available on this site.',
  },
  {
    q: 'Do vouchers need to create an account?',
    a: 'No. Anyone can write a vouch for you using just their name, email, and a few minutes of their time — no sign-up required. This removes friction and means you get more vouches.',
  },
  {
    q: 'Can I use RecommeNow if I am not actively job hunting?',
    a: 'Absolutely. Many users build their profile proactively so it is ready when they need it. Your profile is also useful for freelancers, consultants, and founders who want to demonstrate credibility to potential clients or partners — not just employers.',
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
    <main style={{ minHeight: '100vh', background: 'var(--paper)' }}>
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
          Still have questions? <a href="mailto:hello@recommenow.com" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Drop us a message</a> and we'll get back to you.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {FAQS.map(f => <Item key={f.q} q={f.q} a={f.a} />)}
        </div>
      </div>
    </main>
  )
}
