// Client-safe plan/pricing constants — no Stripe SDK import here

export const PLANS = {
  free: {
    name: 'Free',
    vouchLimit: 10,
    customSlug: false,
  },
  pro: {
    name: 'Pro',
    customSlug: true,
    vouchLimit: Infinity,
  },
} as const

export type PlanKey = keyof typeof PLANS

// Amounts in smallest currency unit (cents/pence)
export const PRO_PRICES: Record<string, { amount: number; display: string }> = {
  usd: { amount: 699,  display: '$6.99 USD' },
  aud: { amount: 999,  display: '$9.99 AUD' },
  gbp: { amount: 499,  display: '£4.99 GBP' },
  eur: { amount: 599,  display: '€5.99 EUR' },
}

export const DEFAULT_CURRENCY = 'usd'
