import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'
import type { Profile, Vouch } from '@/types'
import Stars from '@/components/Stars'
import VouchCard from '@/components/VouchCard'
import FlagVouchButton from './FlagVouchButton'
import RecruiterContactButton from '@/components/RecruiterContactButton'

type Props = { params: Promise<{ slug: string }> }

async function getProfileData(slug: string) {
  const db = createServiceClient()

  const { data: profile } = await db
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!profile) return null

  const { data: vouches } = await db
    .from('vouches')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  const approved = (vouches ?? []) as Vouch[]
  const trustScore =
    approved.length > 0
      ? Math.round((approved.reduce((s, v) => s + v.star_rating, 0) / approved.length) * 10) / 10
      : 0
  const verificationRate =
    approved.length > 0
      ? Math.round((approved.filter((v) => v.verified).length / approved.length) * 100)
      : 0

  return { profile: profile as Profile, vouches: approved, trustScore, verificationRate }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getProfileData(slug)
  if (!data) return { title: 'Profile not found' }

  const { profile, vouches, trustScore } = data
  const title = `${profile.name} — ${vouches.length} verified vouches · RecommeNow`
  const description = `${trustScore}/5 · ${vouches.length} vouches from managers, clients and colleagues`

  return {
    title,
    description,
    openGraph: {
      title: `${profile.name} · ${vouches.length} vouches · ${trustScore}/5`,
      description: `${profile.title ?? ''} · Verified by managers, clients & colleagues. See what people say about working with ${profile.name.split(' ')[0]}.`,
      type: 'profile',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${profile.name} · ${vouches.length} vouches · ${trustScore}/5`,
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

  const { profile, vouches, trustScore, verificationRate } = data

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
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '.92rem', color: 'var(--muted)', textDecoration: 'none' }}
        >
          Recomme<span style={{ color: 'var(--ink)' }}>Now</span>
        </Link>
        <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
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
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'var(--green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap', marginBottom: '.4rem' }}>
                  <h1
                    style={{
                      fontFamily: 'var(--serif)',
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
                </div>
                {profile.title && (
                  <p style={{ fontSize: '.9rem', color: 'var(--muted)', fontWeight: 400, marginBottom: '.4rem' }}>
                    {profile.title}
                    {profile.years_experience && ` · ${profile.years_experience} years`}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                  {profile.location && (
                    <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>📍 {profile.location}</span>
                  )}
                  {profile.remote_preference && (
                    <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>· {profile.remote_preference}</span>
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
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)' }}>
                {vouches.length} verified vouch{vouches.length !== 1 ? 'es' : ''}
              </h2>
              {vouches.length > 0 && (
                <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.2rem' }}>
                  {verificationRate}% email-verified · avg {trustScore}/5
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
              + Add a vouch
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
              <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--muted)', marginBottom: '1rem' }}>
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
                  <VouchCard vouch={v} />
                  <FlagVouchButton vouchId={v.id} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Trust score card */}
          <div
            style={{
              background: 'var(--green)',
              borderRadius: 14,
              padding: '1.75rem',
              color: '#fff',
            }}
          >
            <p style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginBottom: '1.2rem' }}>
              Trust score
            </p>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '.5rem', marginBottom: '.4rem' }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: '3rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                {trustScore > 0 ? trustScore.toFixed(1) : '—'}
              </span>
              <span style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.4)', marginBottom: '.4rem' }}>/5</span>
            </div>
            <Stars rating={Math.round(trustScore)} size={16} />

            <div style={{ borderTop: '1px solid rgba(255,255,255,.12)', marginTop: '1.2rem', paddingTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.5)' }}>Vouches</span>
                <span style={{ fontSize: '.82rem', fontWeight: 600, color: '#fff' }}>{vouches.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.5)' }}>Verified rate</span>
                <span style={{ fontSize: '.82rem', fontWeight: 600, color: '#fff' }}>{verificationRate}%</span>
              </div>
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
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '.9rem', color: 'var(--ink)', marginBottom: '.5rem' }}>
              Want a profile like this?
            </p>
            <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem', fontWeight: 300 }}>
              Free to start — build yours in minutes.
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
