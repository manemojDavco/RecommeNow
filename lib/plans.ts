// Client-safe plan/pricing constants — no Stripe SDK import here.
//
// Plan model (v2):
//   FREE      – 1 received vouch, 1 public vouch. Free for 1 month, then the
//               account auto-closes unless the user subscribes (grandfathered
//               users keep their old allowance). No badge, print or QR.
//   MEMBER    – unlimited received, 1 public vouch. Badge. No print/QR/directory.
//   PRO       – unlimited received, up to 5 public. Badge + print + QR.
//   PRO+      – unlimited received, up to 10 public. Badge + print + QR.
//   RECRUITER – unlimited received, up to 5 public. Everything PRO has, plus the
//               full talent directory.
//
// Users can RECEIVE more vouches than they can PUBLISH; publicVouchCap is the
// number they may show on their public profile.

export type PlanTier = 'free' | 'member' | 'pro' | 'proplus' | 'recruiter'
export type Currency = 'usd' | 'aud' | 'gbp' | 'eur'
export type Interval = 'month' | 'year'

export type PlanDef = {
  key: PlanTier
  name: string
  publicVouchCap: number
  canPrint: boolean
  canQR: boolean
  hasDirectory: boolean
  badgeColor: string | null
  order: number
}

export const PLAN_TIERS: Record<PlanTier, PlanDef> = {
  free:      { key: 'free',      name: 'Free',      publicVouchCap: 1,  canPrint: false, canQR: false, hasDirectory: false, badgeColor: null,      order: 0 },
  member:    { key: 'member',    name: 'Member',    publicVouchCap: 1,  canPrint: false, canQR: false, hasDirectory: false, badgeColor: '#B0885A', order: 1 },
  pro:       { key: 'pro',       name: 'Pro',       publicVouchCap: 5,  canPrint: true,  canQR: true,  hasDirectory: false, badgeColor: '#2D6A4F', order: 2 },
  proplus:   { key: 'proplus',   name: 'Pro+',      publicVouchCap: 10, canPrint: true,  canQR: true,  hasDirectory: false, badgeColor: '#E0A82E', order: 3 },
  recruiter: { key: 'recruiter', name: 'Recruiter', publicVouchCap: 5,  canPrint: true,  canQR: true,  hasDirectory: true,  badgeColor: '#7C5CFF', order: 4 },
}

export function planDef(plan: string | null | undefined): PlanDef {
  return PLAN_TIERS[(plan as PlanTier)] ?? PLAN_TIERS.free
}
export function publicVouchCap(plan: string | null | undefined): number { return planDef(plan).publicVouchCap }
export function planCanPrint(plan: string | null | undefined): boolean { return planDef(plan).canPrint }
export function planCanQR(plan: string | null | undefined): boolean { return planDef(plan).canQR }
export function planHasDirectory(plan: string | null | undefined): boolean { return planDef(plan).hasDirectory }
export function planBadgeColor(plan: string | null | undefined): string | null { return planDef(plan).badgeColor }
export function planName(plan: string | null | undefined): string { return planDef(plan).name }
export function isPaidPlan(plan: string | null | undefined): boolean { return plan != null && plan !== 'free' && plan in PLAN_TIERS }

// ── FREE tier lifecycle ───────────────────────────────────────────────────────
// New FREE accounts get 1 received vouch and expire after FREE_TIER_DAYS unless
// they subscribe. Reminders are sent this many days before expiry.
export const FREE_RECEIVED_CAP = 1
export const FREE_TIER_DAYS = 30
export const FREE_REMINDER_DAYS = [10, 5, 1] as const

// Grandfathered FREE users (signed up under the old 2-vouch, never-expires model)
// keep their allowance. New signups use FREE_RECEIVED_CAP.
export const LEGACY_FREE_RECEIVED_CAP = 2
export function freeReceivedCap(profile: { free_legacy?: boolean | null }): number {
  return profile.free_legacy ? LEGACY_FREE_RECEIVED_CAP : FREE_RECEIVED_CAP
}

// ── In-App Purchase product IDs → plan tier ───────────────────────────────────
export const IAP_PRODUCT_TO_PLAN: Record<string, PlanTier> = {
  'recommenow.MEMBER.monthly':    'member',
  'recommenow.MEMBER.yearly':     'member',
  'recommenow.PRO.monthly':       'pro',
  'recommenow.PRO.yearly':        'pro',
  'recommenow.PROPLUS.monthly':   'proplus',
  'recommenow.PROPLUS.yearly':    'proplus',
  'recommenow.RECRUITER.monthly': 'recruiter',
  'recommenow.RECRUITER.yearly':  'recruiter',
}

// ── Prices ────────────────────────────────────────────────────────────────────
// Amounts in the smallest currency unit (cents/pence). `display` is the
// formatted headline; `monthly` (yearly only) is the per-month equivalent.
type Price = { amount: number; display: string }
type YearlyPrice = Price & { monthly: string }

export const MEMBER_PRICES: Record<Currency, Price> = {
  eur: { amount: 199, display: '€1.99 EUR' },
  usd: { amount: 249, display: '$2.49 USD' },
  gbp: { amount: 149, display: '£1.49 GBP' },
  aud: { amount: 299, display: 'A$2.99 AUD' },
}
export const MEMBER_PRICES_YEARLY: Record<Currency, YearlyPrice> = {
  eur: { amount: 1990, display: '€19.90 EUR', monthly: '€1.66' },
  usd: { amount: 2490, display: '$24.90 USD', monthly: '$2.08' },
  gbp: { amount: 1490, display: '£14.90 GBP', monthly: '£1.24' },
  aud: { amount: 2990, display: 'A$29.90 AUD', monthly: 'A$2.49' },
}

export const PRO_PRICES: Record<Currency, Price> = {
  eur: { amount: 299, display: '€2.99 EUR' },
  usd: { amount: 369, display: '$3.69 USD' },
  gbp: { amount: 269, display: '£2.69 GBP' },
  aud: { amount: 399, display: 'A$3.99 AUD' },
}
export const PRO_PRICES_YEARLY: Record<Currency, YearlyPrice> = {
  eur: { amount: 2990, display: '€29.90 EUR', monthly: '€2.49' },
  usd: { amount: 3690, display: '$36.90 USD', monthly: '$3.08' },
  gbp: { amount: 2690, display: '£26.90 GBP', monthly: '£2.24' },
  aud: { amount: 3990, display: 'A$39.90 AUD', monthly: 'A$3.33' },
}

export const PROPLUS_PRICES: Record<Currency, Price> = {
  eur: { amount: 499, display: '€4.99 EUR' },
  usd: { amount: 599, display: '$5.99 USD' },
  gbp: { amount: 399, display: '£3.99 GBP' },
  aud: { amount: 699, display: 'A$6.99 AUD' },
}
export const PROPLUS_PRICES_YEARLY: Record<Currency, YearlyPrice> = {
  eur: { amount: 4990, display: '€49.90 EUR', monthly: '€4.16' },
  usd: { amount: 5990, display: '$59.90 USD', monthly: '$4.99' },
  gbp: { amount: 3990, display: '£39.90 GBP', monthly: '£3.33' },
  aud: { amount: 6990, display: 'A$69.90 AUD', monthly: 'A$5.83' },
}

export const RECRUITER_PRICES: Record<Currency, Price> = {
  eur: { amount: 1799, display: '€17.99 EUR' },
  usd: { amount: 1999, display: '$19.99 USD' },
  gbp: { amount: 1499, display: '£14.99 GBP' },
  aud: { amount: 2999, display: 'A$29.99 AUD' },
}
export const RECRUITER_PRICES_YEARLY: Record<Currency, YearlyPrice> = {
  eur: { amount: 16900, display: '€169 EUR', monthly: '€14.08' },
  usd: { amount: 19900, display: '$199 USD', monthly: '$16.58' },
  gbp: { amount: 14900, display: '£149 GBP', monthly: '£12.42' },
  aud: { amount: 29900, display: 'A$299 AUD', monthly: 'A$24.92' },
}

// Unified accessor: PLAN_PRICES[plan][interval][currency]
export const PLAN_PRICES = {
  member:    { month: MEMBER_PRICES,    year: MEMBER_PRICES_YEARLY },
  pro:       { month: PRO_PRICES,       year: PRO_PRICES_YEARLY },
  proplus:   { month: PROPLUS_PRICES,   year: PROPLUS_PRICES_YEARLY },
  recruiter: { month: RECRUITER_PRICES, year: RECRUITER_PRICES_YEARLY },
} as const

export const DEFAULT_CURRENCY: Currency = 'usd'
export const CURRENCIES: Currency[] = ['usd', 'eur', 'gbp', 'aud']

// ── Backwards-compatible exports (kept so existing consumers keep building
// while they are migrated to the model above) ────────────────────────────────
export const FREE_VOUCH_LIMIT = FREE_RECEIVED_CAP

export const PLANS = {
  free: { name: 'Free', vouchLimit: FREE_RECEIVED_CAP, customSlug: false },
  pro:  { name: 'Pro',  vouchLimit: Infinity, customSlug: true },
} as const
export type PlanKey = PlanTier

// The old launch "PRO trial" helpers — still referenced by the dashboard.
export function isProTrial(profile: {
  plan: string
  pro_trial_until?: string | null
  stripe_subscription_id?: string | null
}): boolean {
  return (
    profile.plan === 'pro' &&
    !!profile.pro_trial_until &&
    new Date(profile.pro_trial_until) > new Date() &&
    !profile.stripe_subscription_id
  )
}
export function proTrialDaysLeft(proTrialUntil: string | null | undefined): number {
  if (!proTrialUntil) return 0
  const ms = new Date(proTrialUntil).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}
