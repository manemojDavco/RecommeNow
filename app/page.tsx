import Link from 'next/link'
import Nav from '@/components/Nav'

export default function LandingPage() {
  return (
    <>
      <Nav />

      <main>
        {/* ─── HERO ─── */}
        <section
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '9rem 2.5rem 6rem',
            maxWidth: 1100,
            margin: '0 auto',
          }}
        >
          <p
            className="animate-fade-up"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '.6rem',
              fontSize: '.7rem',
              fontWeight: 600,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              marginBottom: '2.5rem',
            }}
          >
            <span style={{ width: 28, height: 1, background: 'var(--rule)', display: 'inline-block' }} />
            Verified peer reputation
          </p>

          <h1
            className="animate-fade-up delay-100"
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(2.8rem, 6.5vw, 5.2rem)',
              fontWeight: 400,
              lineHeight: 1.12,
              letterSpacing: '-.025em',
              color: 'var(--ink)',
              maxWidth: 820,
              marginBottom: '2rem',
            }}
          >
            Let the people who've seen your work{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--green2)' }}>speak for you</em>.
          </h1>

          <p
            className="animate-fade-up delay-200"
            style={{
              fontSize: '1.05rem',
              fontWeight: 300,
              lineHeight: 1.75,
              color: 'var(--muted)',
              maxWidth: 520,
              marginBottom: '3rem',
            }}
          >
            Build a verified reputation profile from real colleagues, managers and clients.
            Share it anywhere you apply — as a link, embed or PDF.
          </p>

          <div
            className="animate-fade-up delay-300"
            style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}
          >
            <Link
              href="/sign-up"
              style={{
                background: 'var(--green)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '.9rem 2rem',
                fontFamily: 'var(--sans)',
                fontSize: '.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'background .2s',
              }}
            >
              Build your profile free →
            </Link>
            <Link
              href="/nick-baker-demo"
              style={{
                background: 'transparent',
                color: 'var(--muted)',
                border: 'none',
                fontFamily: 'var(--sans)',
                fontSize: '.83rem',
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '.4rem',
              }}
            >
              See a sample profile →
            </Link>
          </div>

          {/* social proof faces */}
          <div
            className="animate-fade-up delay-400"
            style={{ marginTop: '5rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}
          >
            <div style={{ display: 'flex' }}>
              {[
                { bg: '#4a7c59', initials: 'SJ' },
                { bg: '#2d5a8e', initials: 'MK' },
                { bg: '#8e5a2d', initials: 'RP' },
                { bg: '#5a2d8e', initials: 'AL' },
              ].map((f) => (
                <div
                  key={f.initials}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: '2px solid var(--white)',
                    marginRight: -8,
                    background: f.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '.6rem',
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  {f.initials}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>2,400+ professionals</strong>
              <br />
              already building their verified reputation
            </p>
          </div>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--rule)', maxWidth: 1100, margin: '0 auto' }} />

        {/* ─── HOW IT WORKS ─── */}
        <section id="how" style={{ padding: '7rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: '.68rem', fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>
            How it works
          </p>
          <h2
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 400,
              lineHeight: 1.18,
              letterSpacing: '-.02em',
              color: 'var(--ink)',
              marginBottom: '1rem',
            }}
          >
            Peer reputation in{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--green2)' }}>four steps</em>.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              marginTop: '4rem',
              borderTop: '1px solid var(--rule)',
            }}
          >
            {[
              {
                n: '01',
                title: 'Create your profile',
                desc: 'Sign up and build your profile in under five minutes. Add your role, experience and a short bio.',
              },
              {
                n: '02',
                title: 'Invite your network',
                desc: 'Send a unique link to colleagues, managers and clients. No app required for them.',
              },
              {
                n: '03',
                title: 'Vouches are verified',
                desc: 'We verify giver emails and flag suspicious submissions. You approve each vouch before it goes live.',
              },
              {
                n: '04',
                title: 'Share everywhere',
                desc: 'Link to your profile in job applications, LinkedIn, email signatures, or embed it on any site.',
              },
            ].map((step, i) => (
              <div
                key={step.n}
                style={{
                  padding: '2.5rem 1.8rem 2.5rem 0',
                  borderRight: i < 3 ? '1px solid var(--rule)' : 'none',
                  paddingLeft: i > 0 ? '1.8rem' : 0,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--serif)',
                    fontSize: '3.5rem',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: 'var(--faint)',
                    lineHeight: 1,
                    marginBottom: '1rem',
                  }}
                >
                  {step.n}
                </div>
                <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '.6rem' }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '.8rem', fontWeight: 300, color: 'var(--muted)', lineHeight: 1.7 }}>
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--rule)', maxWidth: 1100, margin: '0 auto' }} />

        {/* ─── SOCIAL PROOF VOUCHES ─── */}
        <section id="proof" style={{ background: 'var(--paper)', padding: '7rem 0' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2.5rem' }}>
            <p style={{ fontSize: '.68rem', fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>
              Real vouches
            </p>
            <h2
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: 400,
                lineHeight: 1.18,
                letterSpacing: '-.02em',
                color: 'var(--ink)',
              }}
            >
              What verified peers say
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.5rem',
                marginTop: '4rem',
              }}
            >
              {SAMPLE_VOUCHES.map((v, i) => (
                <div
                  key={i}
                  className="vouch-card"
                  style={
                    i === 1
                      ? {
                          background: 'var(--green)',
                          border: 'none',
                        }
                      : {}
                  }
                >
                  <span
                    style={{
                      fontSize: '.62rem',
                      fontWeight: 600,
                      letterSpacing: '.1em',
                      textTransform: 'uppercase',
                      color: i === 1 ? 'rgba(255,255,255,.45)' : 'var(--green2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '.4rem',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        background: i === 1 ? 'rgba(255,255,255,.45)' : 'var(--green2)',
                        borderRadius: '50%',
                        display: 'inline-block',
                      }}
                    />
                    {v.relationship}
                  </span>
                  <blockquote
                    style={{
                      fontFamily: 'var(--serif)',
                      fontStyle: 'italic',
                      fontSize: i === 1 ? '1.05rem' : '.93rem',
                      lineHeight: 1.75,
                      color: i === 1 ? 'rgba(255,255,255,.85)' : 'var(--ink2)',
                      flex: 1,
                    }}
                  >
                    "{v.quote}"
                  </blockquote>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '.75rem',
                      paddingTop: '1.2rem',
                      borderTop: `1px solid ${i === 1 ? 'rgba(255,255,255,.12)' : 'var(--rule)'}`,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: v.avatarColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '.65rem',
                        fontWeight: 700,
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {v.initials}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '.82rem',
                          fontWeight: 600,
                          color: i === 1 ? '#fff' : 'var(--ink)',
                        }}
                      >
                        {v.name}
                      </div>
                      <div
                        style={{
                          fontSize: '.72rem',
                          fontWeight: 300,
                          color: i === 1 ? 'rgba(255,255,255,.45)' : 'var(--muted)',
                          marginTop: 1,
                        }}
                      >
                        {v.role}
                      </div>
                    </div>
                    <div
                      style={{
                        marginLeft: 'auto',
                        width: 20,
                        height: 20,
                        background: i === 1 ? 'rgba(255,255,255,.12)' : 'var(--green-l)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4 7L8 3" stroke={i === 1 ? '#fff' : 'var(--green2)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--rule)', maxWidth: 1100, margin: '0 auto' }} />

        {/* ─── TRUST SIGNALS ─── */}
        <section style={{ padding: '7rem 2.5rem', maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '.68rem', fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>
              Built for trust
            </p>
            <h2
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: 400,
                lineHeight: 1.18,
                letterSpacing: '-.02em',
                color: 'var(--ink)',
                marginBottom: '3rem',
              }}
            >
              Every vouch is{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--green2)' }}>earned</em>.
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--rule)' }}>
              {[
                {
                  icon: '✉',
                  title: 'Work email verification',
                  desc: 'Every vouch giver must verify their email. No anonymous submissions.',
                },
                {
                  icon: '✓',
                  title: 'Candidate approval',
                  desc: 'You review and approve every vouch before it appears on your public profile.',
                },
                {
                  icon: '⚑',
                  title: 'Community flagging',
                  desc: 'Readers can flag suspicious vouches. Three flags triggers automatic review.',
                },
                {
                  icon: '⚡',
                  title: 'Rate limited submissions',
                  desc: 'Max 3 vouches per IP per 4 hours prevents coordinated abuse.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    padding: '1.4rem 0',
                    borderBottom: '1px solid var(--rule)',
                    display: 'flex',
                    gap: '1.2rem',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      background: 'var(--green-l)',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '.9rem',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '.84rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '.2rem' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '.77rem', fontWeight: 300, color: 'var(--muted)', lineHeight: 1.6 }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Score visualisation */}
          <div
            style={{
              background: 'var(--paper)',
              border: '1px solid var(--rule)',
              borderRadius: 14,
              padding: '2.5rem',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  border: '3px solid var(--green)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <span style={{ fontFamily: 'var(--serif)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>4.9</span>
                <span style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em' }}>/ 5</span>
              </div>
              <p style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Average trust score · 14 approved vouches</p>
            </div>

            {[
              { label: 'Communication', pct: 93 },
              { label: 'Leadership', pct: 86 },
              { label: 'Delivery', pct: 100 },
              { label: 'Collaboration', pct: 79 },
            ].map((bar) => (
              <div key={bar.label} style={{ marginBottom: '.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: 'var(--muted)', marginBottom: '.35rem' }}>
                  <span>{bar.label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{bar.pct}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--faint)', borderRadius: 2, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${bar.pct}%`,
                      background: 'var(--green)',
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section
          style={{
            background: 'var(--green)',
            padding: '7rem 2.5rem',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(2rem, 4vw, 3.4rem)',
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: '-.02em',
              color: '#fff',
              marginBottom: '1.2rem',
              maxWidth: 600,
              margin: '0 auto 1.2rem',
            }}
          >
            Ready to let your work{' '}
            <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,.65)' }}>speak for itself</em>?
          </h2>
          <p style={{ fontSize: '.95rem', color: 'rgba(255,255,255,.55)', marginBottom: '2.5rem', fontWeight: 300 }}>
            Free to start. No credit card required.
          </p>
          <Link
            href="/sign-up"
            style={{
              display: 'inline-block',
              background: '#fff',
              color: 'var(--green)',
              borderRadius: 8,
              padding: '1rem 2.4rem',
              fontFamily: 'var(--sans)',
              fontSize: '.9rem',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'transform .2s',
            }}
          >
            Build your profile free →
          </Link>
        </section>

        {/* ─── FOOTER ─── */}
        <footer
          style={{
            padding: '3rem 2.5rem',
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--rule)',
          }}
        >
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '.9rem', color: 'var(--muted)' }}>
            Recomme<span style={{ color: 'var(--ink)' }}>Now</span>
          </span>
          <p style={{ fontSize: '.72rem', color: 'var(--muted)' }}>
            © {new Date().getFullYear()} RecommeNow · privacy · terms
          </p>
        </footer>
      </main>
    </>
  )
}

const SAMPLE_VOUCHES = [
  {
    relationship: 'Former manager',
    quote:
      "Nick consistently delivered complex product work on time and brought clarity to ambiguous situations. One of the most reliable people I've managed.",
    name: 'Sarah Johnson',
    role: 'VP Product · Acme Corp',
    initials: 'SJ',
    avatarColor: '#4a7c59',
  },
  {
    relationship: 'Client',
    quote:
      'Working with Nick felt like having a senior product partner embedded in our team. He asked the right questions and shipped outcomes, not just features.',
    name: 'Marcus Klein',
    role: 'CEO · Fold Financial',
    initials: 'MK',
    avatarColor: '#2d5a8e',
  },
  {
    relationship: 'Peer / colleague',
    quote:
      'Nick is the person you want in the room when things get complicated. Calm, structured, and always focused on the actual problem.',
    name: 'Riya Patel',
    role: 'Senior PM · Stripe',
    initials: 'RP',
    avatarColor: '#8e5a2d',
  },
]
