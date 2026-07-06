// Partner program — shared model and payout math.
// Three channels, one tracking system. A partner's `partner_type` selects the
// payout logic; the exact numbers are stored on the partner row (so a payout is
// always reproducible from the row), and these defaults seed new partners.
//
// Commission rules (from the Partner Program Structure docs):
//   recruiter  — 20% recurring share of NET for 12 months on referred subs
//   influencer — flat bounty per paid conversion (no recurring, no renewals)
//   student    — flat bounty per paid conversion + free PRO while active
//
// Payouts are on CLEARED, non-refunded net revenue, 30 days in arrears.

export type PartnerType = 'recruiter' | 'influencer' | 'student'
export type PartnerCurrency = 'usd' | 'aud' | 'gbp' | 'eur'
export type CommissionEventType = 'conversion' | 'renewal' | 'refund'

// Days a money event waits before it counts toward a payout (absorbs
// refunds/chargebacks).
export const CLEAR_DAYS = 30

export type PartnerConfig = {
  share_pct: number      // recurring % of net (recruiter)
  share_months: number   // eligibility window in months (recruiter)
  bounty_cents: number   // flat per-conversion bounty (influencer/student)
}

// Per (type × currency) defaults, amounts in the smallest currency unit.
// Flat bounties: influencer usd5/aud8/gbp4/eur5, student usd3/aud5/gbp2.50/eur3.
export const PARTNER_DEFAULTS: Record<PartnerType, Record<PartnerCurrency, PartnerConfig>> = {
  recruiter: {
    usd: { share_pct: 20, share_months: 12, bounty_cents: 0 },
    aud: { share_pct: 20, share_months: 12, bounty_cents: 0 },
    gbp: { share_pct: 20, share_months: 12, bounty_cents: 0 },
    eur: { share_pct: 20, share_months: 12, bounty_cents: 0 },
  },
  influencer: {
    usd: { share_pct: 0, share_months: 0, bounty_cents: 500 },
    aud: { share_pct: 0, share_months: 0, bounty_cents: 800 },
    gbp: { share_pct: 0, share_months: 0, bounty_cents: 400 },
    eur: { share_pct: 0, share_months: 0, bounty_cents: 500 },
  },
  student: {
    usd: { share_pct: 0, share_months: 0, bounty_cents: 300 },
    aud: { share_pct: 0, share_months: 0, bounty_cents: 500 },
    gbp: { share_pct: 0, share_months: 0, bounty_cents: 250 },
    eur: { share_pct: 0, share_months: 0, bounty_cents: 300 },
  },
}

export function defaultConfig(type: PartnerType, currency: PartnerCurrency): PartnerConfig {
  return PARTNER_DEFAULTS[type][currency]
}

// A partner row's payout-relevant fields (subset).
export type PartnerLike = {
  share_pct: number | null
  share_months: number | null
  bounty_cents: number | null
}

// The commission-event fields the payout math needs.
export type EventLike = {
  event_type: CommissionEventType
  net_cents: number
  occurred_at: string
}

/**
 * How much this single event owes the partner, in the smallest currency unit.
 *
 * - Recurring-share partners (recruiter): share_pct% of net for every payment
 *   within `share_months` of the first attributed payment. Refunds (negative
 *   net) produce a negative share_due — an automatic clawback.
 * - Flat-bounty partners (influencer/student): the bounty on each `conversion`;
 *   nothing on renewals; a full clawback (−bounty) if that conversion refunds.
 *
 * `firstPaidAt` is the timestamp of the partner-attributed subscription's first
 * cleared payment, used to bound the recruiter's 12-month window. Pass null to
 * skip the window check (treat as in-window).
 */
export function computeShareDue(
  partner: PartnerLike,
  event: EventLike,
  firstPaidAt: string | null,
): number {
  const sharePct = partner.share_pct ?? 0
  const bounty = partner.bounty_cents ?? 0

  if (sharePct > 0) {
    // Recurring share. Enforce the eligibility window (from first paid payment).
    const months = partner.share_months ?? 0
    if (months > 0 && firstPaidAt) {
      const start = new Date(firstPaidAt).getTime()
      const when = new Date(event.occurred_at).getTime()
      const windowEnd = start + months * 30.4375 * 24 * 60 * 60 * 1000
      if (when > windowEnd) return 0
    }
    return Math.round((event.net_cents * sharePct) / 100)
  }

  // Flat bounty.
  if (event.event_type === 'conversion') return bounty
  if (event.event_type === 'refund') return -bounty
  return 0
}

// Eurozone member states (lowercase) — used to map a location to EUR.
const EUROZONE = [
  'austria', 'belgium', 'croatia', 'cyprus', 'estonia', 'finland', 'france',
  'germany', 'greece', 'ireland', 'italy', 'latvia', 'lithuania', 'luxembourg',
  'malta', 'netherlands', 'portugal', 'slovakia', 'slovenia', 'spain',
]

// Pick a payout currency from a profile location string, e.g.
// "Miami, Florida, United States" -> 'usd', "London, England, UK" -> 'gbp'.
export function currencyForLocation(location: string | null | undefined): PartnerCurrency {
  const loc = (location ?? '').toLowerCase()
  if (!loc) return 'usd'
  if (/united kingdom|england|scotland|wales|northern ireland|\buk\b|britain/.test(loc)) return 'gbp'
  if (/australia/.test(loc)) return 'aud'
  if (EUROZONE.some(c => loc.includes(c))) return 'eur'
  return 'usd'
}

// Current period key, e.g. "2026-07".
export function periodOf(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}
