import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { computeShareDue } from '@/lib/partners'

// Nightly clearing job. Any pending commission event whose 30-day window has
// passed is marked `cleared` and its share_due_cents computed from the partner's
// stored config. This is the trust anchor — statements are built on cleared
// rows, so this must be automated and accurate before anything else.
//
// Auth: Bearer CRON_SECRET (same pattern as the other crons).

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()
  const nowIso = new Date().toISOString()

  // Due pending events with their partner's payout config.
  const { data: events, error } = await db
    .from('commission_events')
    .select('id, partner_id, subscription_id, event_type, net_cents, occurred_at, partners(share_pct, share_months, bounty_cents)')
    .eq('status', 'pending')
    .lte('clear_at', nowIso)
    .limit(1000)

  if (error) {
    console.error('[partner-clearing] query failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let cleared = 0
  // Cache the recruiter window start (earliest event) per subscription so we
  // don't re-query for every renewal of the same subscription.
  const firstPaidCache = new Map<string, string | null>()

  type PartnerCfg = { share_pct: number; share_months: number; bounty_cents: number }
  for (const ev of events ?? []) {
    const raw = (ev as { partners: PartnerCfg | PartnerCfg[] | null }).partners
    const partner = Array.isArray(raw) ? raw[0] : raw
    if (!partner) continue

    let firstPaidAt: string | null = null
    if ((partner.share_pct ?? 0) > 0 && ev.subscription_id) {
      if (firstPaidCache.has(ev.subscription_id)) {
        firstPaidAt = firstPaidCache.get(ev.subscription_id) ?? null
      } else {
        const { data: first } = await db
          .from('commission_events')
          .select('occurred_at')
          .eq('partner_id', ev.partner_id)
          .eq('subscription_id', ev.subscription_id)
          .order('occurred_at', { ascending: true })
          .limit(1)
          .maybeSingle()
        firstPaidAt = first?.occurred_at ?? ev.occurred_at
        firstPaidCache.set(ev.subscription_id, firstPaidAt)
      }
    }

    const shareDue = computeShareDue(
      partner,
      { event_type: ev.event_type as 'conversion' | 'renewal' | 'refund', net_cents: ev.net_cents, occurred_at: ev.occurred_at },
      firstPaidAt,
    )

    const { error: upErr } = await db
      .from('commission_events')
      .update({ status: 'cleared', share_due_cents: shareDue })
      .eq('id', ev.id)
    if (!upErr) cleared++
  }

  return NextResponse.json({ ok: true, scanned: events?.length ?? 0, cleared })
}
