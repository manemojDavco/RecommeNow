import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'
import type { Profile, Vouch } from '@/types'
import VouchCard from '@/components/VouchCard'
import FlagVouchButton from './FlagVouchButton'
import RecruiterContactButton from '@/components/RecruiterContactButton'
import { Logo, LocationPin } from '@/components/Logo'
import QrModal from './QrModal'
import ContactInfoButton from './ContactInfoButton'

type Props = { params: Promise<{ slug: string }> }

async function getProfileData(slug: string) {
  const db = createServiceClient()

  const { data: profile } = await db
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!profile) return null

  const { data: vouchesRaw } = await db
    .from('vouches')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  // Sort by display_order in JS so missing column doesn't break the page
  const approved = ((vouchesRaw ?? []) as Vouch[]).sort((a, b) => {
    if (a.display_order == null && b.display_order == null) return 0
    if (a.display_order == null) return 1
    if (b.display_order == null) return -1
    return a.display_order - b.display_order
  })
  const verificationRate =
    approved.length > 0
      ? Math.round((approved.filter((v) => v.verified).length / approved.length) * 100)
      : 0

  // Build email → profile slug map so VouchCard can link givers who have accounts
  const giverEmails = [...new Set(approved.map((v) => v.giver_email).filter(Boolean))]
  const giverSlugMap: Record<string, string> = {}
  if (giverEmails.length > 0) {
    try {
      const params = giverEmails.map((e) => `email_address[]=${encodeURIComponent(e)}`).join('&')
      const clerkRes = await fetch(`https://api.clerk.com/v1/users?${params}&limit=50`, {
        headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
      })
      if (clerkRes.ok) {
        const clerkUsers: Array<{ id: string; email_addresses: Array<{ email_address: string; id: string }>; primary_email_address_id: string }> = await clerkRes.json()
        const userIds = clerkUsers.map((u) => u.id)
        if (userIds.length > 0) {
          const { data: giverProfiles } = await db
            .from('profiles')
            .select('user_id, slug')
            .in('user_id', userIds)
          const userIdToSlug = Object.fromEntries((giverProfiles ?? []).map((p) => [p.user_id, p.slug]))
          for (const u of clerkUsers) {
            const email = u.email_addresses.find((e) => e.id === u.primary_email_address_id)?.email_address
            if (email && userIdToSlug[u.id]) giverSlugMap[email] = userIdToSlug[u.id]
          }
        }
      }
    } catch { /* non-fatal — links just won't appear */ }
  }

  return { profile: profile as Profile, vouches: approved, verificationRate, giverSlugMap }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getProfileData(slug)
  if (!data) return { title: 'Profile not found' }

  const { profile, vouches } = data
  const title = `${profile.name} | ${vouches.length} verified vouches · RecommeNow`
  const description = `${vouches.length} vouches from managers, clients and colleagues · RecommeNow`

  return {
    title,
    description,
    openGraph: {
      title: `${profile.name} · ${vouches.length} verified vouches`,
      description: `${profile.title ?? ''} · Verified by managers, clients & colleagues. See what people say about working with ${profile.name.split(' ')[0]}.`,
      type: 'profile',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${profile.name} · ${vouches.length} verified vouches`,
      description,
    },
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { slug } = await params
  const data = await getProfileData(slug)
  if (!data) notFound()

  const { userId } = await auth()
  let isRecruiter = false
  let candidateEmail: string | null = null
  if (userId) {
    const db = createServiceClient()
    const { data: viewer } = await db
      .from('profiles')
      .select('recruiter_active')
      .eq('user_id', userId)
      .single()
    isRecruiter = viewer?.recruiter_active ?? false

    // Fetch candidate email from Clerk — only expose to recruiters
    if (isRecruiter) {
      try {
        const clerkRes = await fetch(`https://api.clerk.com/v1/users/${data.profile.user_id}`, {
          headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
        })
        if (clerkRes.ok) {
          const u = await clerkRes.json()
          candidateEmail = u.email_addresses?.find(
            (e: { id: string }) => e.id === u.primary_email_address_id
          )?.email_address ?? null
        }
      } catch { /* non-fatal */ }
    }
  }

  const { profile, vouches, verificationRate, giverSlugMap } = data

  const relationshipCounts = vouches.reduce<Record<string, number>>((acc, v) => {
    const r = v.giver_relationship ?? 'Other'
    acc[r] = (acc[r] ?? 0) + 1
    return acc
  }, {})

  const topTraits = Object.entries(
    vouches
      .flatMap((v) => v.traits ?? [])
      .reduce<Record<string, number>>((acc, t) => {
        acc[t] = (acc[t] ?? 0) + 1
        return acc
      }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      {/* Sticky nav */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(250,249,247,.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--rule)',
          padding: '1rem 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Logo variant="dark" href="/" size={30} />
        <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
          <QrModal slug={profile.slug} name={profile.name.split(' ')[0]} />
          <Link
            href={`/vouch/${profile.slug}`}
            style={{
              background: 'var(--green)',
              color: '#fff',
              border: 'none',
              borderRadius: 7,
              padding: '.5rem 1rem',
              fontFamily: 'var(--sans)',
              fontSize: '.75rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Vouch for {profile.name.split(' ')[0]}
          </Link>
          <Link
            href="/sign-up"
            style={{
              border: '1px solid var(--rule)',
              background: 'var(--white)',
              borderRadius: 7,
              padding: '.5rem 1rem',
              fontFamily: 'var(--sans)',
              fontSize: '.75rem',
              fontWeight: 600,
              color: 'var(--muted)',
              textDecoration: 'none',
            }}
          >
            Build my profile
          </Link>
        </div>
      </nav>

      <div
        style={{
          maxWidth: 1060,
          margin: '0 auto',
          padding: '3rem 1.5rem 6rem',
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        {/* ─── LEFT COLUMN ─── */}
        <div>
          {/* Profile header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <ContactInfoButton
                name={profile.name}
                linkedinUrl={profile.linkedin_url}
                phone={(profile as any).phone}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'var(--green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--sans)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#fff',
                    overflow: 'hidden',
                  }}
                >
                  {profile.photo_url
                    ? <img src={profile.photo_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initials}
                </div>
              </ContactInfoButton>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap', marginBottom: '.4rem' }}>
                  <h1
                    style={{
                      fontFamily: 'var(--sans)',
                      fontSize: '1.7rem',
                      fontWeight: 700,
                      letterSpacing: '-.02em',
                      color: 'var(--ink)',
                    }}
                  >
                    {profile.name}
                  </h1>
                  {verificationRate >= 50 && (
                    <span className="badge-verified">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4L3 5.5L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Verified
                    </span>
                  )}
                  {((profile as any).recruiter_active || (profile as any).plan === 'pro') && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24" style={{ flexShrink: 0 }}>
                      {(profile as any).recruiter_active ? <>
                        <circle cx="9" cy="10" r="4" fill="#5B21B6"/>
                        <path d="M3 26 Q3 18 9 18 Q15 18 15 26 Z" fill="#5B21B6"/>
                        <path d="M14 20 Q18 17 20 17" stroke="#A78BFA" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                        <polygon points="20,17 16.5,14.5 16.5,19.5" fill="#A78BFA"/>
                        <circle cx="23" cy="10" r="4" fill="#A78BFA"/>
                        <path d="M17 26 Q17 18 23 18 Q29 18 29 26 Z" fill="#A78BFA"/>
                        <circle cx="28" cy="5" r="4" fill="#5B21B6"/>
                        <polyline points="25.8,5 27,6.3 30.2,3" stroke="#fff" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </> : <>
                        <circle cx="9" cy="10" r="4" fill="#2D6A4F"/>
                        <path d="M3 26 Q3 18 9 18 Q15 18 15 26 Z" fill="#2D6A4F"/>
                        <path d="M14 20 Q18 17 20 17" stroke="#52B788" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                        <polygon points="20,17 16.5,14.5 16.5,19.5" fill="#52B788"/>
                        <circle cx="23" cy="10" r="4" fill="#52B788"/>
                        <path d="M17 26 Q17 18 23 18 Q29 18 29 26 Z" fill="#52B788"/>
                        <circle cx="28" cy="5" r="4" fill="#2D6A4F"/>
                        <polyline points="25.8,5 27,6.3 30.2,3" stroke="#fff" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </>}
                    </svg>
                  )}
                </div>
                {profile.title && (
                  <p style={{ fontSize: '.9rem', color: 'var(--muted)', fontWeight: 400, marginBottom: '.4rem' }}>
                    {profile.title}
                    {profile.years_experience && ` · ${profile.years_experience} years`}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                  {profile.location && (
                    <span style={{ fontSize: '.75rem', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center' }}><LocationPin />{profile.location}</span>
                  )}
                  {profile.remote_preference && (
                    <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>· {profile.remote_preference}</span>
                  )}
                  {profile.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '.3rem',
                        fontSize: '.75rem',
                        color: '#0a66c2',
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>

            {profile.bio && (
              <p style={{ fontSize: '.9rem', fontWeight: 300, lineHeight: 1.75, color: 'var(--ink2)', maxWidth: 600 }}>
                {profile.bio}
              </p>
            )}

            {/* Industries + stages */}
            {(profile.industries?.length > 0 || profile.stages?.length > 0) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginTop: '1rem' }}>
                {[...(profile.industries ?? []), ...(profile.stages ?? [])].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: 'var(--paper)',
                      border: '1px solid var(--rule)',
                      borderRadius: 100,
                      padding: '3px 10px',
                      fontSize: '.7rem',
                      color: 'var(--muted)',
                      fontWeight: 500,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--rule)', marginBottom: '2.5rem' }} />

          {/* Vouches header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--sans)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)' }}>
                {vouches.length} verified vouch{vouches.length !== 1 ? 'es' : ''}
              </h2>
              {vouches.length > 0 && (
                <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.2rem' }}>
                  {verificationRate}% email-verified
                  {Object.keys(relationshipCounts).length > 0 && (
                    <> · {
                      Object.entries(relationshipCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([r]) => r.toLowerCase())
                        .join(', ')
                    }</>
                  )}
                </p>
              )}
            </div>
            <Link
              href={`/vouch/${profile.slug}`}
              style={{
                background: 'var(--green-l)',
                color: 'var(--green)',
                border: '1px solid var(--green-m)',
                borderRadius: 7,
                padding: '.5rem 1rem',
                fontSize: '.75rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Give {profile.name.split(' ')[0]} a Vouch
            </Link>
          </div>

          {vouches.length === 0 ? (
            <div
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--rule)',
                borderRadius: 12,
                padding: '3rem',
                textAlign: 'center',
              }}
            >
              <p style={{ fontFamily: 'var(--sans)', fontSize: '1rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                No approved vouches yet
              </p>
              <Link
                href={`/vouch/${profile.slug}`}
                style={{
                  background: 'var(--green)',
                  color: '#fff',
                  borderRadius: 7,
                  padding: '.6rem 1.2rem',
                  fontSize: '.8rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Be the first to vouch for {profile.name.split(' ')[0]}
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {vouches.map((v) => (
                <div key={v.id} style={{ position: 'relative' }}>
                  <VouchCard vouch={v} giverSlug={giverSlugMap[v.giver_email] ?? null} />
                  <FlagVouchButton vouchId={v.id} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Vouch summary card */}
          <div
            style={{
              background: 'var(--green)',
              borderRadius: 14,
              padding: '1.75rem',
              color: '#fff',
            }}
          >
            <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginBottom: '1.2rem' }}>
              Vouch summary
            </p>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '.4rem', marginBottom: '1.2rem' }}>
              <span style={{ fontFamily: 'var(--sans)', fontSize: '3rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                {vouches.length}
              </span>
              <span style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.5)', marginBottom: '.5rem' }}>
                {vouches.length === 1 ? 'vouch' : 'vouches'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.5)' }}>Email verified</span>
                <span style={{ fontSize: '.82rem', fontWeight: 600, color: '#fff' }}>{verificationRate}%</span>
              </div>
              {Object.keys(relationshipCounts).length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.5)' }}>Relationship types</span>
                  <span style={{ fontSize: '.82rem', fontWeight: 600, color: '#fff' }}>{Object.keys(relationshipCounts).length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Relationship breakdown */}
          {Object.keys(relationshipCounts).length > 0 && (
            <div className="card">
              <p style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>
                Who's vouching
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                {Object.entries(relationshipCounts).map(([rel, count]) => (
                  <div key={rel} style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.25rem' }}>
                        <span>{rel}</span>
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{count}</span>
                      </div>
                      <div style={{ height: 3, background: 'var(--faint)', borderRadius: 2 }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${(count / vouches.length) * 100}%`,
                            background: 'var(--green)',
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top traits */}
          {topTraits.length > 0 && (
            <div className="card">
              <p style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>
                Most mentioned traits
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                {topTraits.map(([trait, count]) => (
                  <span
                    key={trait}
                    className="trait-pill"
                    style={{ gap: '.3rem' }}
                  >
                    {trait}
                    <span style={{ opacity: 0.5, fontSize: '.6rem' }}>{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recruiter contact */}
          <RecruiterContactButton
            candidateSlug={profile.slug}
            candidateName={profile.name}
            candidatePhone={profile.phone ?? null}
            candidateEmail={candidateEmail}
            isRecruiter={isRecruiter}
            isSignedIn={!!userId}
          />

          {/* CTA */}
          <div className="card-paper" style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '.9rem', color: 'var(--ink)', marginBottom: '.5rem' }}>
              Want a profile like this?
            </p>
            <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem', fontWeight: 300 }}>
              Free to start. Build yours in minutes.
            </p>
            <Link
              href="/sign-up"
              style={{
                display: 'block',
                background: 'var(--green)',
                color: '#fff',
                borderRadius: 7,
                padding: '.65rem',
                fontSize: '.78rem',
                fontWeight: 600,
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Build my profile →
            </Link>
          </div>
        </aside>
      </div>
    </>
  )
}
