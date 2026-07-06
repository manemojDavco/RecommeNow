import type { SupabaseClient } from '@supabase/supabase-js'
import { CLEAR_DAYS, periodOf, type CommissionEventType } from './partners'

export type RecordCommissionParams = {
  referredByPartnerId: string | null | undefined
  profileId?: string | null
  userId?: string | null
  source: 'stripe' | 'apple'
  eventType: CommissionEventType
  plan?: string | null
  currency: string
  grossCents: number          // amount billed (negative for refunds)
  feeCents?: number           // processor fee (positive)
  subscriptionId?: string | null
  externalEventId: string     // idempotency key (unique per money event)
  occurredAt?: Date
}

/**
 * Write one commission event for a partner-referred subscription. No-op when
 * the user has no partner. Idempotent: a duplicate external_event_id is ignored.
 * Never throws — a failure here must not break a webhook or a purchase.
 * share_due is left 0 and computed by the nightly clearing job.
 */
export async function recordCommissionEvent(
  db: SupabaseClient,
  p: RecordCommissionParams,
): Promise<void> {
  if (!p.referredByPartnerId) return
  try {
    const occurred = p.occurredAt ?? new Date()
    const fee = p.feeCents ?? 0
    const { error } = await db.from('commission_events').insert({
      partner_id: p.referredByPartnerId,
      profile_id: p.profileId ?? null,
      user_id: p.userId ?? null,
      subscription_id: p.subscriptionId ?? null,
      source: p.source,
      event_type: p.eventType,
      plan: p.plan ?? null,
      currency: p.currency.toLowerCase(),
      gross_cents: Math.round(p.grossCents),
      fee_cents: Math.round(fee),
      net_cents: Math.round(p.grossCents - fee),
      period: periodOf(occurred),
      occurred_at: occurred.toISOString(),
      clear_at: new Date(occurred.getTime() + CLEAR_DAYS * 86400000).toISOString(),
      status: 'pending',
      external_event_id: p.externalEventId,
    })
    // 23505 = unique violation (already recorded); 42P01/42703 = not migrated yet.
    if (error && !['23505', '42P01', '42703'].includes(error.code ?? '')) {
      console.error('[partner-events] insert failed:', error.code, error.message)
    }
  } catch (e) {
    console.error('[partner-events] unexpected error:', e)
  }
}

/**
 * Look up a profile's partner attribution by Clerk user id, including the
 * partner's payout currency. Returns null if unmigrated / not partner-referred.
 */
export async function partnerRefByUserId(
  db: SupabaseClient,
  userId: string,
): Promise<{ profileId: string; partnerId: string; currency: string } | null> {
  try {
    const { data: prof } = await db
      .from('profiles')
      .select('id, referred_by_partner_id')
      .eq('user_id', userId)
      .maybeSingle()
    if (!prof?.referred_by_partner_id) return null
    const { data: partner } = await db
      .from('partners')
      .select('currency')
      .eq('id', prof.referred_by_partner_id)
      .maybeSingle()
    return { profileId: prof.id, partnerId: prof.referred_by_partner_id, currency: partner?.currency ?? 'usd' }
  } catch {
    return null
  }
}

/**
 * Look up a profile's partner attribution by Stripe customer id.
 * Returns null if unmigrated, not found, or not partner-referred.
 */
export async function partnerRefByStripeCustomer(
  db: SupabaseClient,
  customerId: string,
): Promise<{ profileId: string; userId: string | null; partnerId: string } | null> {
  try {
    const { data } = await db
      .from('profiles')
      .select('id, user_id, referred_by_partner_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()
    if (!data?.referred_by_partner_id) return null
    return { profileId: data.id, userId: data.user_id ?? null, partnerId: data.referred_by_partner_id }
  } catch {
    return null
  }
}
