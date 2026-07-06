import Link from 'next/link'
import Nav from '@/components/Nav'
import { getPartnerForCurrentUser } from '@/lib/partner-auth'
import { createServiceClient } from '@/lib/supabase-server'
import { computePartnerStats, money } from '@/lib/partner-stats'
import { planName } from '@/lib/plans'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Partner dashboard' }

const TYPE_LABEL: Record<string, string> = {
  recruiter: 'Recruitment partner', influencer: 'Influencer', student: 'Student ambassador',
}

export default async function PartnerPage() {
  const partner = await getPartnerForCurrentUser()

  if (!partner) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--sans)' }}>
        <Nav />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink)' }}>Partner dashboard</h1>
          <p style={{ color: 'var(--muted)', marginTop: '1rem', lineHeight: 1.7 }}>
            This account isn&apos;t linked to a partner. If you run a recruitment agency, create
            career content, or represent a student society and want to partner with RecommeNow,
            get in touch at <a href="mailto:social@recommenow.com" style={{ color: 'var(--green)' }}>social@recommenow.com</a>.
          </p>
        </div>
      </div>
    )
  }

  const db = createServiceClient()
  const stats = await computePartnerStats(db, partner.id)
  const cur = partner.currency
  const isRecruiter = partner.partner_type === 'recruiter'
  const link = `https://recommenow.com/r/${partner.code}`

  const cards: { label: string; value: string; sub?: string }[] = [
    { label: 'Signups this month', value: String(stats.signups_this_month), sub: `${stats.signups_total} all-time` },
    { label: 'Paid conversions', value: String(stats.conversions_total) },
    { label: isRecruiter ? 'Cleared net revenue' : 'Cleared conversions', value: isRecruiter ? money(stats.cleared_net_cents, cur) : String(stats.conversions_total) },
    { label: isRecruiter ? 'Share due' : 'Bounties due', value: money(stats.share_due_cents, cur), sub: stats.share_paid_cents ? `${money(stats.share_paid_cents, cur)} paid` : undefined },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--sans)' }}>
      <Nav />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--green)' }}>
              {TYPE_LABEL[partner.partner_type] ?? 'Partner'}
            </p>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--ink)', margin: '.2rem 0 0' }}>{partner.name}</h1>
          </div>
          {partner.partner_type === 'student' && (
            <Link href="/partner/leaderboard" style={{ fontSize: '.85rem', color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>
              View leaderboard →
            </Link>
          )}
        </div>

        {/* Referral link */}
        <div style={{ marginTop: '1.5rem', background: '#fff', border: '1px solid var(--rule)', borderRadius: 12, padding: '1rem 1.25rem' }}>
          <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase', margin: 0 }}>Your referral link</p>
          <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', margin: '.35rem 0 0', wordBreak: 'break-all' }}>{link}</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          {cards.map(c => (
            <div key={c.label} style={{ background: '#fff', border: '1px solid var(--rule)', borderRadius: 12, padding: '1.1rem 1.25rem' }}>
              <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.04em', textTransform: 'uppercase', margin: 0 }}>{c.label}</p>
              <p style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--ink)', margin: '.35rem 0 0' }}>{c.value}</p>
              {c.sub && <p style={{ fontSize: '.75rem', color: 'var(--muted)', margin: '.15rem 0 0' }}>{c.sub}</p>}
            </div>
          ))}
        </div>

        {/* Monthly statement */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>Monthly statement</h2>
          <a href="/api/partner/statement" style={{ fontSize: '.8rem', color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Download CSV ↓</a>
        </div>
        <div style={{ overflowX: 'auto', marginTop: '.75rem' }}>
          <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--rule)' }}>
            <thead>
              <tr style={{ background: 'var(--paper2, #f8f7f2)' }}>
                {['Month', 'Signups', 'Conversions', isRecruiter ? 'Cleared net' : 'Cleared', isRecruiter ? 'Share due' : 'Bounty due'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Month' ? 'left' : 'right', padding: '.7rem .9rem', fontSize: '.75rem', color: 'var(--muted)', borderBottom: '1px solid var(--rule)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.by_period.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--muted)', fontSize: '.85rem' }}>No activity yet — share your link to get started.</td></tr>
              )}
              {stats.by_period.map(r => (
                <tr key={r.period}>
                  <td style={{ padding: '.7rem .9rem', fontSize: '.85rem', fontWeight: 600, color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>{r.period}</td>
                  <td style={{ padding: '.7rem .9rem', fontSize: '.85rem', textAlign: 'right', color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>{r.signups}</td>
                  <td style={{ padding: '.7rem .9rem', fontSize: '.85rem', textAlign: 'right', color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>{r.conversions}</td>
                  <td style={{ padding: '.7rem .9rem', fontSize: '.85rem', textAlign: 'right', color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>{money(r.cleared_net_cents, cur)}</td>
                  <td style={{ padding: '.7rem .9rem', fontSize: '.85rem', textAlign: 'right', fontWeight: 700, color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>{money(r.share_due_cents, cur)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '1rem', lineHeight: 1.6 }}>
          Payouts are calculated on cleared, non-refunded revenue, 30 days in arrears.
          {isRecruiter
            ? ` You earn ${partner.share_pct}% of net for ${partner.share_months} months on each referred subscription.`
            : ` You earn ${money(partner.bounty_cents, cur)} per paid conversion.`}
          {' '}Referred plans include {planName('member')}, {planName('pro')} and {planName('proplus')}.
        </p>
      </div>
    </div>
  )
}
