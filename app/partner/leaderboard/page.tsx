import Nav from '@/components/Nav'
import { createServiceClient } from '@/lib/supabase-server'

// Public student-ambassador leaderboard. Ranks active student partners by paid
// conversions. Shows first name / handle only — never full names or any
// candidate data.
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Ambassador leaderboard' }

function firstNameOnly(name: string): string {
  const first = (name ?? '').trim().split(/\s+/)[0] ?? ''
  return first || 'Ambassador'
}

export default async function LeaderboardPage() {
  const db = createServiceClient()

  const { data: students } = await db
    .from('partners')
    .select('id, name')
    .eq('partner_type', 'student')
    .eq('status', 'active')
    .limit(500)

  const { data: events } = await db
    .from('commission_events')
    .select('partner_id')
    .eq('event_type', 'conversion')
    .limit(20000)

  const counts = new Map<string, number>()
  for (const e of events ?? []) counts.set(e.partner_id, (counts.get(e.partner_id) ?? 0) + 1)

  const board = (students ?? [])
    .map(s => ({ name: firstNameOnly(s.name), conversions: counts.get(s.id) ?? 0 }))
    .sort((a, b) => b.conversions - a.conversions)
    .slice(0, 25)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'var(--sans)' }}>
      <Nav />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '3.5rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--ink)', textAlign: 'center' }}>Ambassador leaderboard</h1>
        <p style={{ color: 'var(--muted)', textAlign: 'center', marginTop: '.5rem' }}>Top student ambassadors by paid conversions.</p>

        <div style={{ marginTop: '2rem', background: '#fff', border: '1px solid var(--rule)', borderRadius: 14, overflow: 'hidden' }}>
          {board.length === 0 && (
            <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '.9rem' }}>No ambassadors yet.</p>
          )}
          {board.map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.85rem 1.25rem', borderBottom: i < board.length - 1 ? '1px solid var(--rule)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem' }}>
                <span style={{ width: 26, textAlign: 'center', fontWeight: 800, color: i < 3 ? 'var(--green)' : 'var(--muted)' }}>{i + 1}</span>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{row.name}</span>
              </div>
              <span style={{ fontWeight: 800, color: 'var(--ink)' }}>{row.conversions}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
