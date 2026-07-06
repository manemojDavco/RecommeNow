import type { SupabaseClient } from '@supabase/supabase-js'
import { periodOf } from './partners'

export type PeriodRow = {
  period: string            // YYYY-MM
  signups: number
  conversions: number
  cleared_net_cents: number
  share_due_cents: number   // cleared but not yet paid
}

export type PartnerStats = {
  signups_total: number
  signups_this_month: number
  conversions_total: number
  cleared_net_cents: number     // lifetime cleared net (excludes refunds already)
  share_due_cents: number       // cleared and unpaid — what you owe now
  share_paid_cents: number      // already paid out
  by_period: PeriodRow[]        // newest first
}

/**
 * Compute a partner's dashboard numbers from referred profiles + commission
 * events. Aggregated in JS (volumes are small at this stage). Everything is
 * scoped to one partner_id — the caller must pass the authenticated partner.
 */
export async function computePartnerStats(
  db: SupabaseClient,
  partnerId: string,
): Promise<PartnerStats> {
  const thisMonth = periodOf(new Date())

  // Referred signups (attribution on the account).
  const { data: profiles } = await db
    .from('profiles')
    .select('id, referred_at')
    .eq('referred_by_partner_id', partnerId)
    .limit(10000)

  // Commission events.
  const { data: events } = await db
    .from('commission_events')
    .select('event_type, net_cents, share_due_cents, status, period, occurred_at')
    .eq('partner_id', partnerId)
    .limit(10000)

  const periods = new Map<string, PeriodRow>()
  const ensure = (p: string): PeriodRow => {
    let row = periods.get(p)
    if (!row) { row = { period: p, signups: 0, conversions: 0, cleared_net_cents: 0, share_due_cents: 0 }; periods.set(p, row) }
    return row
  }

  let signupsTotal = 0
  let signupsThisMonth = 0
  for (const pr of profiles ?? []) {
    signupsTotal++
    const p = pr.referred_at ? periodOf(pr.referred_at) : 'unknown'
    ensure(p).signups++
    if (p === thisMonth) signupsThisMonth++
  }

  let conversionsTotal = 0
  let clearedNet = 0
  let shareDue = 0
  let sharePaid = 0
  for (const ev of events ?? []) {
    const p = ev.period ?? (ev.occurred_at ? periodOf(ev.occurred_at) : 'unknown')
    const row = ensure(p)
    if (ev.event_type === 'conversion') { conversionsTotal++; row.conversions++ }
    if (ev.status === 'cleared' || ev.status === 'paid') {
      clearedNet += ev.net_cents ?? 0
      row.cleared_net_cents += ev.net_cents ?? 0
    }
    if (ev.status === 'cleared') { shareDue += ev.share_due_cents ?? 0; row.share_due_cents += ev.share_due_cents ?? 0 }
    if (ev.status === 'paid')    { sharePaid += ev.share_due_cents ?? 0 }
  }

  const byPeriod = [...periods.values()].sort((a, b) => (a.period < b.period ? 1 : -1))

  return {
    signups_total: signupsTotal,
    signups_this_month: signupsThisMonth,
    conversions_total: conversionsTotal,
    cleared_net_cents: clearedNet,
    share_due_cents: shareDue,
    share_paid_cents: sharePaid,
    by_period: byPeriod,
  }
}

// Format cents in a currency for display, e.g. (2490,'gbp') -> "£24.90".
const SYMBOL: Record<string, string> = { usd: '$', aud: 'A$', gbp: '£', eur: '€' }
export function money(cents: number, currency: string): string {
  const sym = SYMBOL[currency.toLowerCase()] ?? ''
  const v = (cents / 100).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${cents < 0 ? '-' : ''}${sym}${v.replace('-', '')}`
}
