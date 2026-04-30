import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-server'
import type Stripe from 'stripe'

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
      const planType = session.metadata?.plan_type ?? 'pro'
      const subscriptionId = session.subscription as string | null
      if (!profileId || !subscriptionId) break

      if (planType === 'recruiter') {
        await db.from('profiles')
          .update({ recruiter_active: true, recruiter_subscription_id: subscriptionId })
          .eq('id', profileId)
      } else {
        await db.from('profiles')
          .update({ plan: 'pro', stripe_subscription_id: subscriptionId })
          .eq('id', profileId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const active = sub.status === 'active' || sub.status === 'trialing'

      // Determine which product this sub belongs to by checking metadata on the subscription
      const productName = (sub.items?.data?.[0]?.price?.product as Stripe.Product | undefined)?.name ?? ''
      const isRecruiter = productName.toLowerCase().includes('recruiter')
        || sub.metadata?.plan_type === 'recruiter'

      if (isRecruiter) {
        await db.from('profiles')
          .update({ recruiter_active: active })
          .eq('recruiter_subscription_id', sub.id)
      } else {
        await db.from('profiles')
          .update({ plan: active ? 'pro' : 'free' })
          .eq('stripe_customer_id', customerId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      // Try recruiter first, then candidate pro
      const { count: recruiterCount } = await db
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('recruiter_subscription_id', sub.id)

      if ((recruiterCount ?? 0) > 0) {
        await db.from('profiles')
          .update({ recruiter_active: false, recruiter_subscription_id: null })
          .eq('recruiter_subscription_id', sub.id)
      } else {
        const customerId = sub.customer as string
        await db.from('profiles')
          .update({ plan: 'free', stripe_subscription_id: null })
          .eq('stripe_customer_id', customerId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
