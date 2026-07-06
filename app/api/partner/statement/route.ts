import { NextResponse } from 'next/server'
import { getPartnerForCurrentUser } from '@/lib/partner-auth'
import { createServiceClient } from '@/lib/supabase-server'
import { computePartnerStats } from '@/lib/partner-stats'

// CSV statement for the signed-in partner, scoped to their own rows only.
export const dynamic = 'force-dynamic'

export async function GET() {
  const partner = await getPartnerForCurrentUser()
  if (!partner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = createServiceClient()
  const stats = await computePartnerStats(db, partner.id)

  const rows = [
    ['Month', 'Signups', 'Conversions', 'Cleared net (cents)', 'Share due (cents)', 'Currency'],
    ...stats.by_period.map(r => [
      r.period, r.signups, r.conversions, r.cleared_net_cents, r.share_due_cents, partner.currency.toUpperCase(),
    ]),
  ]
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="recommenow-statement-${partner.code}.csv"`,
    },
  })
}
