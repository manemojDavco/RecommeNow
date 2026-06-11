// Client-safe plan/pricing constants — no Stripe SDK import here

// FREE accounts can RECEIVE at most this many vouches (counting every received
// vouch regardless of status). At the limit, all request/share/submit actions
// are disabled until one is deleted.
export const FREE_VOUCH_LIMIT = 2

export const PLANS = {
  free: {
    name: 'Free',
    vouchLimit: FREE_VOUCH_LIMIT,
    customSlug: false,
  },
  pro: {
    name: 'Pro',
    customSlug: true,
    vouchLimit: Infinity,
  },
} as const

export type PlanKey = keyof typeof PLANS

// Amounts in smallest currency unit (cents/pence) — monthly
export const PRO_PRICES: Record<string, { amount: number; display: string }> = {
  usd: { amount: 699,  display: '$6.99 USD' },
  aud: { amount: 999,  display: '$9.99 AUD' },
  gbp: { amount: 499,  display: '£4.99 GBP' },
  eur: { amount: 599,  display: '€5.99 EUR' },
}

// Yearly = 10 × monthly, billed as one annual charge
export const PRO_PRICES_YEARLY: Record<string, { amount: number; display: string; monthly: string }> = {
  usd: { amount: 6990,  display: '$69.90 USD', monthly: '$5.83' },
  aud: { amount: 9990,  display: '$99.90 AUD', monthly: '$8.33' },
  gbp: { amount: 4990,  display: '£49.90 GBP', monthly: '£4.16' },
  eur: { amount: 5990,  display: '€59.90 EUR', monthly: '€4.99' },
}

export const DEFAULT_CURRENCY = 'usd'

// Returns true if the profile has an active PRO trial (plan = 'pro' granted for
// free, pro_trial_until is set and in the future, and no paid Stripe subscription).
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

// Days remaining in PRO trial (0 if not a trial user)
export function proTrialDaysLeft(proTrialUntil: string | null | undefined): number {
  if (!proTrialUntil) return 0
  const ms = new Date(proTrialUntil).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

// Recruiter plan prices — monthly
export const RECRUITER_PRICES: Record<string, { amount: number; display: string }> = {
  usd: { amount: 1999, display: '$19.99 USD' },
  aud: { amount: 2999, display: '$29.99 AUD' },
  gbp: { amount: 1499, display: '£14.99 GBP' },
  eur: { amount: 1799, display: '€17.99 EUR' },
}

// Recruiter yearly — whole-number prices matching the App Store price points
export const RECRUITER_PRICES_YEARLY: Record<string, { amount: number; display: string; monthly: string }> = {
  usd: { amount: 19900, display: '$199 USD', monthly: '$16.58' },
  aud: { amount: 29900, display: '$299 AUD', monthly: '$24.92' },
  gbp: { amount: 14900, display: '£149 GBP', monthly: '£12.42' },
  eur: { amount: 17900, display: '€179 EUR', monthly: '€14.92' },
}
