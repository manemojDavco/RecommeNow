// Phase 2 scaffold — Stripe integration not yet active
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
})

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    vouchLimit: 10,
    customSlug: false,
  },
  pro: {
    name: 'Pro',
    price: 900, // $9/mo in cents
    vouchLimit: Infinity,
    customSlug: true,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
  },
} as const
