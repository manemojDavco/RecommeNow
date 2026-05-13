import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const { data: profile } = await db
    .from('profiles')
    .select('id, name, stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const stripe = getStripe()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'

  // Create Stripe customer on-the-fly if not yet created
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

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/dashboard/settings`,
  })

  return NextResponse.json({ url: session.url })
}
