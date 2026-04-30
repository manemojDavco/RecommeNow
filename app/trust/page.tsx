import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Trust & Verification Policy',
  description: 'How RecommeNow ensures every vouch is real, verified and trustworthy.',
}

const sections = [
  {
    title: 'What is a vouch?',
    body: `A vouch is a structured reference from someone who has directly worked with a candidate — as a manager, colleague, direct report, or client. Vouches include a written quote, a star rating (1–5), relationship context, and optional trait tags. They are collected via a unique link sent by the candidate.`,
  },
  {
    title: 'How email verification works',
    body: `Every vouch giver receives an email asking them to confirm their submission. Until they click the confirmation link, the vouch is marked as unverified. Verified vouches display a checkmark and contribute to the candidate's verification rate. This step makes it significantly harder to fabricate references — the vouch giver must access their inbox.`,
  },
  {
    title: 'How the Trust Score is calculated',
    body: `The Trust Score is the average star rating across all approved and publicly visible vouches. It ranges from 1.0 to 5.0 and is rounded to one decimal place. A score only appears when a profile has at least one approved vouch. Ratings from hidden or flagged vouches are excluded.`,
  },
  {
    title: 'Vouch approval & moderation',
    body: `Candidates review every incoming vouch before it becomes public. They can approve (make it live), hide (remove it from the public view without deleting), or let it remain pending. Candidates cannot edit vouch content — they can only decide whether it appears publicly. This prevents cherry-picking by rewording negative feedback.`,
  },
  {
    title: 'Flagging & the 48-hour review queue',
    body: `Anyone viewing a public profile can flag a vouch as suspicious, fake, or inappropriate. When a vouch accumulates flags, it enters a manual review queue. The candidate is notified. If the flag is upheld after review, the vouch is removed regardless of the candidate's approval status. Our team reserves the right to remove any vouch that violates our content policy.`,
  },
  {
    title: 'Velocity and burst detection',
    body: `Our rate-limiting layer (powered by Upstash Redis) caps vouch submissions per IP address within a rolling 4-hour window. Sudden spikes in vouch submissions from the same IP, network, or email domain trigger an automatic hold and queue the vouches for manual review before they can be approved. This prevents coordinated reputation inflation.`,
  },
  {
    title: 'What we do not do',
    body: `We do not write, edit, or generate vouch content on behalf of users. We do not contact vouch givers on a candidate's behalf beyond the single verification email. We do not sell or share vouch data with third parties. We do not accept payment in exchange for vouch approval, removal, or score modification.`,
  },
  {
    title: 'Reporting abuse',
    body: `If you believe a profile or vouch violates our policies, use the flag button on any vouch card, or contact us at trust@recommenow.com. We review all reports within 48 hours.`,
  },
]

export default function TrustPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--sans)' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid var(--rule)', background: 'var(--white)' }}>
        <Link href="/" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--ink)', textDecoration: 'none' }}>
          Recomme<span style={{ color: 'var(--green)' }}>Now</span>
        </Link>
        <Link href="/directory" style={{ fontSize: '.82rem', color: 'var(--muted)', textDecoration: 'none' }}>Directory →</Link>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '4rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '.6rem' }}>
            Trust & Verification
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 700, color: 'var(--ink)', marginBottom: '.75rem' }}>
            How we keep vouches real
          </h1>
          <p style={{ fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.7 }}>
            A reputation is only worth something if it's hard to fake. Here's every layer of protection we've built into RecommeNow.
          </p>
        </div>

        {/* Trust indicators bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
          {[
            { icon: '✉', label: 'Email-verified', sub: 'Every vouch giver confirms by email' },
            { icon: '✓', label: 'Candidate-approved', sub: 'Candidate reviews before going live' },
            { icon: '⚑', label: 'Community-flagged', sub: 'Anyone can flag suspicious vouches' },
          ].map(({ icon, label, sub }) => (
            <div key={label} style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, padding: '1.2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '.5rem' }}>{icon}</div>
              <p style={{ fontWeight: 700, fontSize: '.82rem', color: 'var(--ink)', marginBottom: '.25rem' }}>{label}</p>
              <p style={{ fontSize: '.72rem', color: 'var(--muted)', lineHeight: 1.5 }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {sections.map(({ title, body }) => (
            <div key={title}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.6rem' }}>
                {title}
              </h2>
              <p style={{ fontSize: '.88rem', color: 'var(--ink2)', lineHeight: 1.75 }}>{body}</p>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div style={{ marginTop: '4rem', padding: '2rem', background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 12, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.5rem' }}>
            Have a question about a specific vouch or profile?
          </p>
          <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
            Our trust team reviews all reports within 48 hours.
          </p>
          <a
            href="mailto:trust@recommenow.com"
            style={{ display: 'inline-block', background: 'var(--green)', color: '#fff', borderRadius: 8, padding: '.7rem 1.5rem', fontSize: '.83rem', fontWeight: 600, textDecoration: 'none' }}
          >
            Contact trust@recommenow.com
          </a>
        </div>
      </div>
    </div>
  )
}
