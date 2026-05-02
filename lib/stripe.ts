import Stripe from 'stripe'
export { PLANS, PRO_PRICES, RECRUITER_PRICES, PRO_PRICES_YEARLY, RECRUITER_PRICES_YEARLY, DEFAULT_CURRENCY } from './plans'
export type { PlanKey } from './plans'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
      apiVersion: '2024-06-20',
    })
  }
  return _stripe
}
