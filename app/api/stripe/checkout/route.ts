import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-server'
import { PLAN_PRICES, PLAN_TIERS, DEFAULT_CURRENCY, isProTrial, type Currency, type Interval } from '@/lib/plans'

type PaidPlan = 'member' | 'pro' | 'proplus' | 'recruiter'
const PAID_PLANS: PaidPlan[] = ['member', 'pro', 'proplus', 'recruiter']

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const currency = ((body.currency ?? DEFAULT_CURRENCY).toLowerCase()) as Currency
  const planType = (PAID_PLANS.includes(body.planType) ? body.planType : 'pro') as PaidPlan
  const interval: Interval = body.interval === 'year' ? 'year' : 'month'

  const priceConfig = PLAN_PRICES[planType][interval][currency]
  if (!priceConfig) return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 })

  const db = createServiceClient()
  const { data: profile } = await db
    .from('profiles')
    .select('id, name, slug, stripe_customer_id, plan, pro_trial_until, stripe_subscription_id, recruiter_active')
    .eq('user_id', userId)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  // Block only if the user is already on this exact paid plan (switching between
  // different paid tiers is allowed — Stripe handles the proration/change).
  if (profile.plan === planType && !isProTrial(profile)) {
    return NextResponse.json({ error: `Already on the ${PLAN_TIERS[planType].name} plan` }, { status: 400 })
  }

  const stripe = getStripe()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'

  // Reuse or create Stripe customer
  let customerId = profile.stripe_customer_id ?? undefined
  if (!customerId) {
    let email: string | undefined
    try {
      const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
      })
      if (clerkRes.ok) {
        const u = await clerkRes.json()
        email = u.email_addresses?.find((e: { id: string }) => e.id === u.primary_email_address_id)?.email_address
      }
    } catch { /* non-fatal */ }

    const customer = await stripe.customers.create({
      name: profile.name,
      email,
      metadata: { user_id: userId, profile_id: profile.id },
    })
    customerId = customer.id
    await db.from('profiles').update({ stripe_customer_id: customerId }).eq('id', profile.id)
  }

  const def = PLAN_TIERS[planType]
  const productName = `RecommeNow ${def.name}`
  const productDesc = planType === 'recruiter'
    ? 'Publish up to 5 vouches + full talent directory'
    : `Publish up to ${def.publicVouchCap} vouch${def.publicVouchCap === 1 ? '' : 'es'}${def.canPrint ? ' + PDF one-pager + QR code' : ''}`

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency,
        unit_amount: priceConfig.amount,
        recurring: { interval },
        product_data: { name: productName, description: productDesc },
      },
      quantity: 1,
    }],
    subscription_data: { metadata: { plan_type: planType, user_id: userId, profile_id: profile.id } },
    success_url: `${appUrl}/dashboard?${planType === 'recruiter' ? 'recruiter=1' : 'upgraded=1'}`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { user_id: userId, profile_id: profile.id, plan_type: planType },
  })

  return NextResponse.json({ url: session.url })
}
