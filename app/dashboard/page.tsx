import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase-server'
import type { Vouch } from '@/types'
import Stars from '@/components/Stars'
import UpgradedBanner from './UpgradedBanner'
import RecruiterBanner from './RecruiterBanner'

export default async function DashboardOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; recruiter?: string }>
}) {
  const { upgraded, recruiter } = await searchParams
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const db = createServiceClient()
  const { data: profile } = await db.from('profiles').select('*').eq('user_id', userId).single()
  if (!profile) redirect('/onboarding')

  const { data: allVouches } = await db
    .from('vouches')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })

  const vouches = (allVouches ?? []) as Vouch[]
  const approved = vouches.filter((v) => v.status === 'approved')
  const pending = vouches.filter((v) => v.status === 'pending')
  const flagged = vouches.filter((v) => v.status === 'flagged')

  const trustScore =
    approved.length > 0
      ? Math.round((approved.reduce((s, v) => s + v.star_rating, 0) / approved.length) * 10) / 10
      : 0
  const verificationRate =
    approved.length > 0
      ? Math.round((approved.filter((v) => v.verified).length / approved.length) * 100)
      : 0

  const recentVouches = vouches.slice(0, 5)

  return (
    <div style={{ padding: '2rem 2.5rem', flex: 1 }}>
      {upgraded === '1' && <UpgradedBanner />}
      {recruiter === '1' && <RecruiterBanner />}

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.25rem' }}>
          Good to see you, {profile.name.split(' ')[0]}
        </h1>
        <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
          Here's an overview of your reputation profile.
        </p>
      </div>

      {/* Recruiter directory shortcut — full width */}
      {profile.recruiter_active && (
        <div style={{ background: 'var(--ink)', borderRadius: 12, padding: '1.1rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.2rem' }}>Recruiter access</p>
            <p style={{ fontSize: '.85rem', fontWeight: 600, color: '#fff' }}>Browse the talent directory</p>
          </div>
          <Link href="/directory" style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, padding: '.5rem 1rem', fontSize: '.75rem', fontWeight: 600, color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Open Directory →
          </Link>
        </div>
      )}

      {/* Stats row — full width */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Trust score', value: trustScore > 0 ? `${trustScore}/5` : '—', sub: 'avg star rating' },
          { label: 'Approved vouches', value: approved.length, sub: 'live on your profile' },
          { label: 'Verification rate', value: `${verificationRate}%`, sub: 'email-verified' },
          { label: 'Pending review', value: pending.length, sub: 'awaiting your approval', highlight: pending.length > 0 },
        ].map((stat) => (
          <div key={stat.label} style={{ background: 'var(--white)', border: `1px solid ${stat.highlight ? 'var(--amber)' : 'var(--rule)'}`, borderRadius: 10, padding: '1.25rem' }}>
            <p style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.6rem' }}>{stat.label}</p>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', fontWeight: 700, color: stat.highlight ? 'var(--amber)' : 'var(--green)', lineHeight: 1, marginBottom: '.2rem' }}>{stat.value}</p>
            <p style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Two-column: recent vouches + right sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>

        {/* Recent vouches */}
        <div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--ink)' }}>Recent vouches</h2>
              <Link href="/dashboard/vouches" style={{ fontSize: '.75rem', color: 'var(--green2)', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
            </div>

            {recentVouches.length === 0 ? (
              <div style={{ padding: '3rem 1.25rem', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--muted)', fontSize: '.9rem', marginBottom: '1rem' }}>No vouches yet</p>
                <Link href={`/vouch/${profile.slug}`} style={{ background: 'var(--green)', color: '#fff', borderRadius: 7, padding: '.6rem 1.2rem', fontSize: '.78rem', fontWeight: 600, textDecoration: 'none' }}>
                  Share your vouch link →
                </Link>
              </div>
            ) : (
              recentVouches.map((v) => (
                <div key={v.id} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--green-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>
                    {v.giver_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.2rem' }}>
                      <div>
                        <span style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--ink)' }}>{v.giver_name}</span>
                        {v.giver_company && <span style={{ fontSize: '.75rem', color: 'var(--muted)', marginLeft: '.4rem' }}>· {v.giver_company}</span>}
                      </div>
                      <Stars rating={v.star_rating} size={11} />
                    </div>
                    <p style={{ fontSize: '.78rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{v.quote}"</p>
                  </div>
                  <StatusBadge status={v.status} verified={v.verified} />
                </div>
              ))
            )}
          </div>

          {pending.length > 0 && (
            <div style={{ background: 'var(--amber-l)', border: '1px solid var(--amber)', borderRadius: 10, padding: '1.1rem 1.25rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--ink)' }}>{pending.length} vouch{pending.length !== 1 ? 'es' : ''} waiting for approval</p>
                <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.1rem' }}>Review and approve to make them live on your profile.</p>
              </div>
              <Link href="/dashboard/approvals" style={{ background: 'var(--amber)', color: '#fff', borderRadius: 7, padding: '.5rem 1rem', fontSize: '.78rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>Review now →</Link>
            </div>
          )}

          {flagged.length > 0 && (
            <div style={{ background: 'var(--red-l)', border: '1px solid var(--red)', borderRadius: 10, padding: '1.1rem 1.25rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--ink)' }}>{flagged.length} flagged vouch{flagged.length !== 1 ? 'es' : ''}</p>
                <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '.1rem' }}>Review flagged submissions in the Flagged tab.</p>
              </div>
              <Link href="/dashboard/flagged" style={{ background: 'var(--red)', color: '#fff', borderRadius: 7, padding: '.5rem 1rem', fontSize: '.78rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>Review →</Link>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, padding: '1.25rem' }}>
            <p style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.75rem' }}>Your vouch link</p>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 7, padding: '.6rem .9rem', fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'}/vouch/{profile.slug}
            </div>
            <Link href="/dashboard/share" className="btn-primary" style={{ fontSize: '.78rem', padding: '.55rem 1rem', display: 'block', textAlign: 'center' }}>
              Share & Embed options
            </Link>
          </div>

          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, padding: '1.25rem' }}>
            <p style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.75rem' }}>Profile completeness</p>
            {[
              { label: 'Name', done: !!profile.name },
              { label: 'Title', done: !!profile.title },
              { label: 'Bio', done: !!profile.bio },
              { label: 'Location', done: !!profile.location },
              { label: 'Industries', done: profile.industries?.length > 0 },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{item.label}</span>
                <span style={{ fontSize: '.75rem', fontWeight: 600, color: item.done ? 'var(--green2)' : 'var(--rule)' }}>{item.done ? '✓' : '○'}</span>
              </div>
            ))}
            <Link href="/dashboard/settings" style={{ fontSize: '.75rem', color: 'var(--green2)', textDecoration: 'none', fontWeight: 500, marginTop: '.5rem', display: 'block' }}>Edit profile →</Link>
          </div>
        </div>

      </div>
    </div>
  )
}

function StatusBadge({ status, verified }: { status: string; verified: boolean }) {
  const configs: Record<string, { bg: string; color: string; label: string }> = {
    approved: { bg: 'var(--green-l)', color: 'var(--green2)', label: 'Live' },
    pending: { bg: 'var(--amber-l)', color: '#b07010', label: 'Pending' },
    hidden: { bg: 'var(--paper)', color: 'var(--muted)', label: 'Hidden' },
    flagged: { bg: 'var(--red-l)', color: 'var(--red)', label: 'Flagged' },
  }
  const cfg = configs[status] ?? configs.pending
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        borderRadius: 100,
        padding: '2px 8px',
        fontSize: '.65rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
      {status === 'approved' && verified && ' · ✓'}
    </span>
  )
}
