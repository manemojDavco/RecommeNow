import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-server'
import { PLAN_TIERS, type PlanTier } from '@/lib/plans'
import { recordCommissionEvent, partnerRefByStripeCustomer } from '@/lib/partner-events'
import type Stripe from 'stripe'

// Map a Stripe product name ("RecommeNow Pro+") back to a plan tier, as a
// fallback when subscription metadata is unavailable.
function planFromProductName(name: string | undefined): PlanTier | undefined {
  const n = (name ?? '').toLowerCase()
  // Longest names first so "Pro+" matches before "Pro".
  const keys = (Object.keys(PLAN_TIERS) as PlanTier[])
    .filter(k => k !== 'free')
    .sort((a, b) => PLAN_TIERS[b].name.length - PLAN_TIERS[a].name.length)
  for (const key of keys) {
    if (n.includes(PLAN_TIERS[key].name.toLowerCase())) return key
  }
  return undefined
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ''

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Webhook signature verification failed'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const db = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const profileId = session.metadata?.profile_id
      const planType = (session.metadata?.plan_type ?? 'pro') as PlanTier
      const subscriptionId = session.subscription as string | null
      if (!profileId || !subscriptionId) break

      // Set the plan tier, and reopen the account + clear the FREE expiry timer.
      await db.from('profiles')
        .update({
          plan: planType,
          stripe_subscription_id: subscriptionId,
          recruiter_active: planType === 'recruiter',
          recruiter_subscription_id: planType === 'recruiter' ? subscriptionId : null,
          free_expires_at: null,
          account_closed_at: null,
          free_reminders_sent: [],
        })
        .eq('id', profileId)
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const active = sub.status === 'active' || sub.status === 'trialing'
      const planType = (sub.metadata?.plan_type as PlanTier | undefined) ?? planFromProductName((sub.items?.data?.[0]?.price?.product as Stripe.Product | undefined)?.name)

      if (active && planType) {
        await db.from('profiles')
          .update({ plan: planType, recruiter_active: planType === 'recruiter', free_expires_at: null, account_closed_at: null })
          .eq('stripe_customer_id', customerId)
      } else if (!active) {
        await db.from('profiles')
          .update({ plan: 'free', recruiter_active: false })
          .eq('stripe_customer_id', customerId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      await db.from('profiles')
        .update({ plan: 'free', recruiter_active: false, stripe_subscription_id: null, recruiter_subscription_id: null })
        .eq('stripe_customer_id', customerId)
      break
    }

    // ── Partner commission: a payment cleared ────────────────────────────────
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string | null
      if (!customerId || invoice.amount_paid <= 0) break
      const ref = await partnerRefByStripeCustomer(db, customerId)
      if (!ref) break // not partner-referred — nothing to record

      // Processor fee → net. Retrieve the charge's balance transaction; fall
      // back to gross if unavailable.
      let feeCents = 0
      const chargeId = (invoice as unknown as { charge?: string }).charge
      if (chargeId) {
        try {
          const charge = await stripe.charges.retrieve(chargeId, { expand: ['balance_transaction'] })
          const bt = charge.balance_transaction
          if (bt && typeof bt !== 'string') feeCents = bt.fee ?? 0
        } catch { /* fee stays 0 */ }
      }

      const isFirst = invoice.billing_reason === 'subscription_create'
      const plan = (invoice.lines?.data?.[0]?.price?.metadata?.plan_type as string | undefined)
        ?? planFromProductName((invoice.lines?.data?.[0]?.price?.product as Stripe.Product | undefined)?.name)
      await recordCommissionEvent(db, {
        referredByPartnerId: ref.partnerId,
        profileId: ref.profileId,
        userId: ref.userId,
        source: 'stripe',
        eventType: isFirst ? 'conversion' : 'renewal',
        plan: plan ?? null,
        currency: invoice.currency,
        grossCents: invoice.amount_paid,
        feeCents,
        subscriptionId: (invoice as unknown as { subscription?: string }).subscription ?? null,
        externalEventId: `stripe:invoice:${invoice.id}`,
      })
      break
    }

    // ── Partner commission: a refund (clawback) ──────────────────────────────
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      const customerId = charge.customer as string | null
      if (!customerId || charge.amount_refunded <= 0) break
      const ref = await partnerRefByStripeCustomer(db, customerId)
      if (!ref) break
      await recordCommissionEvent(db, {
        referredByPartnerId: ref.partnerId,
        profileId: ref.profileId,
        userId: ref.userId,
        source: 'stripe',
        eventType: 'refund',
        currency: charge.currency,
        grossCents: -charge.amount_refunded, // negative → clawback
        feeCents: 0,
        subscriptionId: null,
        externalEventId: `stripe:refund:${charge.id}:${charge.amount_refunded}`,
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
