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
    .select('id, recruiter_active, recruiter_subscription_id')
    .eq('user_id', userId)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (!profile.recruiter_active) return NextResponse.json({ error: 'No active Recruiter plan' }, { status: 400 })

  const subId = profile.recruiter_subscription_id
  if (!subId) return NextResponse.json({ error: 'No billing account found' }, { status: 400 })

  const stripe = getStripe()
  await stripe.subscriptions.update(subId, { cancel_at_period_end: true })

  return NextResponse.json({ ok: true })
}
