import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getStripe, PRO_PRICES, RECRUITER_PRICES, PRO_PRICES_YEARLY, RECRUITER_PRICES_YEARLY, DEFAULT_CURRENCY } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-server'
import { isProTrial } from '@/lib/plans'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const currency: string = (body.currency ?? DEFAULT_CURRENCY).toLowerCase()
  const planType: 'pro' | 'recruiter' = body.planType === 'recruiter' ? 'recruiter' : 'pro'
  const interval: 'month' | 'year' = body.interval === 'year' ? 'year' : 'month'

  const priceMap = interval === 'year'
    ? (planType === 'recruiter' ? RECRUITER_PRICES_YEARLY : PRO_PRICES_YEARLY)
    : (planType === 'recruiter' ? RECRUITER_PRICES : PRO_PRICES)
  const priceConfig = priceMap[currency]
  if (!priceConfig) return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 })

  const db = createServiceClient()
  const { data: profile } = await db
    .from('profiles')
    .select('id, name, slug, stripe_customer_id, plan, pro_trial_until, stripe_subscription_id, recruiter_active')
    .eq('user_id', userId)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  // Allow trial users (plan='pro' but no paid subscription) to upgrade to paid
  if (planType === 'pro' && profile.plan === 'pro' && !isProTrial(profile)) {
    return NextResponse.json({ error: 'Already on Pro plan' }, { status: 400 })
  }
  if (planType === 'recruiter' && profile.recruiter_active) {
    return NextResponse.json({ error: 'Already on Recruiter plan' }, { status: 400 })
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

  const productName = planType === 'recruiter' ? 'RecommeNow Recruiter' : 'RecommeNow Pro'
  const productDesc = planType === 'recruiter'
    ? 'Contact candidates & access full talent directory'
    : 'Unlimited vouches + custom slug'

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
    success_url: `${appUrl}/dashboard?${planType === 'recruiter' ? 'recruiter=1' : 'upgraded=1'}`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { user_id: userId, profile_id: profile.id, plan_type: planType },
  })

  return NextResponse.json({ url: session.url })
}
