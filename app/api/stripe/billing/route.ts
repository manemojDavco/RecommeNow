import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const { data: profile } = await db
    .from('profiles')
    .select('id, stripe_customer_id, stripe_subscription_id, recruiter_subscription_id, plan, recruiter_active')
    .eq('user_id', userId)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const stripe = getStripe()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'

  // Determine plan label
  const planLabel = profile.recruiter_active ? 'recruiter' : profile.plan === 'pro' ? 'pro' : 'free'

  // If no Stripe customer yet, return minimal response
  if (!profile.stripe_customer_id) {
    return NextResponse.json({
      plan: planLabel,
      subscription: null,
      invoices: [],
      paymentMethod: null,
      updatePaymentUrl: null,
    })
  }

  const customerId = profile.stripe_customer_id
  const subscriptionId = profile.recruiter_subscription_id ?? profile.stripe_subscription_id ?? null

  let subscription = null
  let invoices: object[] = []
  let paymentMethod = null
  let updatePaymentUrl: string | null = null

  // Fetch subscription
  if (subscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['default_payment_method'],
      })
      const item = sub.items.data[0]
      subscription = {
        id: sub.id,
        status: sub.status,
        currentPeriodEnd: sub.current_period_end,
        amount: item?.price?.unit_amount ?? null,
        currency: item?.price?.currency ?? null,
        interval: item?.price?.recurring?.interval ?? null,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      }

      // Extract payment method from subscription
      const pm = sub.default_payment_method
      if (pm && typeof pm === 'object' && 'card' in pm && pm.card) {
        paymentMethod = {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
        }
      }
    } catch { /* subscription not found — leave as null */ }
  }

  // If no payment method from subscription, try customer's default
  if (!paymentMethod) {
    try {
      const customer = await stripe.customers.retrieve(customerId, {
        expand: ['invoice_settings.default_payment_method'],
      })
      if (customer && !('deleted' in customer)) {
        const pm = customer.invoice_settings?.default_payment_method
        if (pm && typeof pm === 'object' && 'card' in pm && pm.card) {
          paymentMethod = {
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          }
        }
      }
    } catch { /* non-fatal */ }
  }

  // Fetch invoices
  try {
    const invoiceList = await stripe.invoices.list({ customer: customerId, limit: 24 })
    invoices = invoiceList.data.map((inv) => ({
      id: inv.id,
      date: inv.created,
      amount: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      pdfUrl: inv.invoice_pdf,
      hostedUrl: inv.hosted_invoice_url,
    }))
  } catch { /* non-fatal */ }

  // Create payment method update portal session URL
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard/billing`,
      flow_data: { type: 'payment_method_update' },
    })
    updatePaymentUrl = portalSession.url
  } catch { /* non-fatal */ }

  return NextResponse.json({
    plan: planLabel,
    subscription,
    invoices,
    paymentMethod,
    updatePaymentUrl,
  })
}

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const { data: profile } = await db
    .from('profiles')
    .select('id, stripe_subscription_id, recruiter_subscription_id, recruiter_active')
    .eq('user_id', userId)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const subscriptionId = profile.recruiter_subscription_id ?? profile.stripe_subscription_id ?? null
  if (!subscriptionId) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
  }

  const stripe = getStripe()

  try {
    await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })

    // Update profile — mark as pending cancellation (plan remains until period end)
    // We don't downgrade immediately; webhook handles final downgrade
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to cancel subscription' }, { status: 500 })
  }
}
