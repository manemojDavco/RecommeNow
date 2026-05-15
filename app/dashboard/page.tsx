import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase-server'
import type { Vouch } from '@/types'
import UpgradedBanner from './UpgradedBanner'
import RecruiterBanner from './RecruiterBanner'
import RecruiterDirectoryCard from './RecruiterDirectoryCard'

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

  const verificationRate =
    approved.length > 0
      ? Math.round((approved.filter((v) => v.verified).length / approved.length) * 100)
      : 0

  const recentVouches = vouches.slice(0, 4)

  return (
    <div style={{ padding: '1.5rem 2rem', flex: 1 }}>
      {upgraded === '1' && <UpgradedBanner />}
      {recruiter === '1' && <RecruiterBanner />}

      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ fontFamily: 'var(--sans)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.15rem' }}>
          Good to see you, {profile.name.split(' ')[0]}
        </h1>
        <p style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
          Here's an overview of your reputation profile.
        </p>
      </div>

      {/* Recruiter directory shortcut — full width */}
      {profile.recruiter_active && <RecruiterDirectoryCard />}

      {/* Stats row — full width */}
      <div className="rn-dash-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '.75rem', marginBottom: '1rem' }}>
        {[
          { label: 'Approved vouches', value: approved.length, sub: 'live on your profile', href: '/dashboard/vouches' },
          { label: 'Unique vouchers', value: new Set(approved.map((v) => v.giver_email)).size, sub: 'distinct people', href: null },
          { label: 'Verification rate', value: `${verificationRate}%`, sub: 'email-verified', href: null },
          { label: 'Pending review', value: pending.length, sub: 'awaiting your approval', highlight: pending.length > 0, href: '/dashboard/approvals' },
        ].map((stat) => {
          const inner = (
            <>
              <p style={{ fontSize: '.65rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.5rem' }}>{stat.label}</p>
              <p style={{ fontFamily: 'var(--sans)', fontSize: '1.6rem', fontWeight: 700, color: stat.highlight ? 'var(--amber)' : 'var(--green)', lineHeight: 1, marginBottom: '.15rem' }}>{stat.value}</p>
              <p style={{ fontSize: '.65rem', color: 'var(--muted)' }}>{stat.sub}</p>
            </>
          )
          const sharedStyle = { background: 'var(--white)', border: `1px solid ${stat.highlight ? 'var(--amber)' : 'var(--rule)'}`, borderRadius: 10, padding: '1rem' }
          return stat.href ? (
            <Link key={stat.label} href={stat.href} style={{ ...sharedStyle, textDecoration: 'none', display: 'block', cursor: 'pointer' }}>
              {inner}
            </Link>
          ) : (
            <div key={stat.label} style={sharedStyle}>
              {inner}
            </div>
          )
        })}
      </div>

      {/* Two-column: recent vouches + right sidebar */}
      <div className="rn-dash-overview-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>

        {/* Recent vouches */}
        <div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '.85rem 1.1rem', borderBottom: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--ink)' }}>Recent vouches</h2>
              <Link href="/dashboard/vouches" style={{ fontSize: '.72rem', color: 'var(--green2)', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
            </div>

            {recentVouches.length === 0 ? (
              <div style={{ padding: '2.5rem 1.1rem', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--sans)', color: 'var(--muted)', fontSize: '.9rem', marginBottom: '1rem' }}>No vouches yet</p>
                <Link href={`/vouch/${profile.slug}`} style={{ background: 'var(--green)', color: '#fff', borderRadius: 7, padding: '.6rem 1.2rem', fontSize: '.78rem', fontWeight: 600, textDecoration: 'none' }}>
                  Share your vouch link →
                </Link>
              </div>
            ) : (
              recentVouches.map((v) => (
                <div key={v.id} style={{ padding: '.75rem 1.1rem', borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'flex-start', gap: '.75rem' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: ['#4a7c59','#2d5a8e','#8e5a2d','#5a2d8e','#7c4a4a','#4a7c7c'][v.giver_name.split('').reduce((a:number,c:string)=>a+c.charCodeAt(0),0)%6], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.62rem', fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: '1px' }}>
                    {v.giver_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.2rem' }}>
                      <div style={{ minWidth: 0, marginRight: '.5rem' }}>
                        <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--ink)' }}>{v.giver_name}</span>
                        {v.giver_company && <span style={{ fontSize: '.72rem', color: 'var(--muted)', marginLeft: '.35rem' }}>· {v.giver_company}</span>}
                      </div>
                      <StatusBadge status={v.status} verified={v.verified} />
                    </div>
                    <p style={{
                      fontSize: '.74rem',
                      color: 'var(--muted)',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.45,
                    }}>"{v.quote}"</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {pending.length > 0 && (
            <div style={{ background: 'var(--amber-l)', border: '1px solid var(--amber)', borderRadius: 10, padding: '.85rem 1.1rem', marginTop: '.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--ink)' }}>{pending.length} vouch{pending.length !== 1 ? 'es' : ''} waiting for approval</p>
                <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.1rem' }}>Review and approve to make them live on your profile.</p>
              </div>
              <Link href="/dashboard/approvals" style={{ background: 'var(--amber)', color: '#fff', borderRadius: 7, padding: '.45rem .9rem', fontSize: '.75rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>Review now →</Link>
            </div>
          )}

          {flagged.length > 0 && (
            <div style={{ background: 'var(--red-l)', border: '1px solid var(--red)', borderRadius: 10, padding: '.85rem 1.1rem', marginTop: '.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--ink)' }}>{flagged.length} flagged vouch{flagged.length !== 1 ? 'es' : ''}</p>
                <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.1rem' }}>Review flagged submissions in the Flagged tab.</p>
              </div>
              <Link href="/dashboard/flagged" style={{ background: 'var(--red)', color: '#fff', borderRadius: 7, padding: '.45rem .9rem', fontSize: '.75rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>Review →</Link>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, padding: '1rem' }}>
            <p style={{ fontSize: '.65rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.6rem' }}>Your vouch link</p>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 7, padding: '.5rem .75rem', fontSize: '.72rem', color: 'var(--muted)', marginBottom: '.6rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'}/vouch/{profile.slug}
            </div>
            <Link href="/dashboard/share" className="btn-primary" style={{ fontSize: '.75rem', padding: '.5rem .9rem', display: 'block', textAlign: 'center' }}>
              Share & Embed options
            </Link>
          </div>

          {(profile.plan === 'pro' || profile.recruiter_active) && (
            <a
              href={`/${profile.slug}/print`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--green-l)',
                border: '1px solid var(--green-m)',
                borderRadius: 10,
                padding: '1rem',
                textDecoration: 'none',
                gap: '.75rem',
              }}
            >
              <div>
                <p style={{ fontSize: '.65rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.3rem' }}>PDF one-pager</p>
                <p style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--ink)' }}>Print to PDF →</p>
                <p style={{ fontSize: '.68rem', color: 'var(--muted)', marginTop: '.15rem' }}>Profile + top vouches, print-ready</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
              </svg>
            </a>
          )}

          <div style={{ background: 'var(--white)', border: '1px solid var(--rule)', borderRadius: 10, padding: '1rem' }}>
            <p style={{ fontSize: '.65rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.6rem' }}>Profile completeness</p>
            {[
              { label: 'Name', done: !!profile.name },
              { label: 'Title', done: !!profile.title },
              { label: 'Bio', done: !!profile.bio },
              { label: 'Location', done: !!profile.location },
              { label: 'Industries', done: profile.industries?.length > 0 },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
                <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{item.label}</span>
                <span style={{ fontSize: '.72rem', fontWeight: 600, color: item.done ? 'var(--green2)' : 'var(--rule)' }}>{item.done ? '✓' : '○'}</span>
              </div>
            ))}
            <Link href="/dashboard/settings" style={{ fontSize: '.72rem', color: 'var(--green2)', textDecoration: 'none', fontWeight: 500, marginTop: '.4rem', display: 'block' }}>Edit profile →</Link>
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
