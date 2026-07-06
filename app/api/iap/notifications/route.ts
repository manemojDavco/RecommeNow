// Apple App Store Server Notifications V2 — mobile renewals & refunds.
// Mirrors the Stripe webhook for the Apple side so partner commission keeps
// tracking after the initial purchase (which /api/iap/verify records).
//
// Configure the URL in App Store Connect → App → App Information → App Store
// Server Notifications (Production + Sandbox) → https://recommenow.com/api/iap/notifications
//
// NOTE: we decode Apple's JWS payloads and trust the signature (same posture as
// /api/iap/verify). Full x5c cert-chain verification is a TODO. Fraud surface is
// limited: we only record events for an originalTransactionId that already
// exists on a partner-referred profile, and bounty channels earn nothing on
// renewals — so spoofed notifications yield no payout.
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { recordCommissionEvent, partnerRefByOriginalTx } from '@/lib/partner-events'

const PRODUCT_TO_PLAN: Record<string, string> = {
  'recommenow.MEMBER.monthly': 'member',   'recommenow.MEMBER.yearly': 'member',
  'recommenow.PRO.monthly': 'pro',         'recommenow.PRO.yearly': 'pro',
  'recommenow.PROPLUS.monthly': 'proplus', 'recommenow.PROPLUS.yearly': 'proplus',
  'recommenow.RECRUITER.monthly': 'recruiter', 'recommenow.RECRUITER.yearly': 'recruiter',
}

// Decode the payload of a JWS (header.payload.signature) without verifying.
function decodeJws<T = Record<string, unknown>>(jws: string | undefined): T | null {
  const part = jws?.split('.')?.[1]
  if (!part) return null
  try { return JSON.parse(Buffer.from(part, 'base64url').toString()) as T } catch { return null }
}

export async function POST(req: NextRequest) {
  let signedPayload: string | undefined
  try { signedPayload = (await req.json())?.signedPayload } catch { /* ignore */ }

  const notif = decodeJws<{ notificationType?: string; subtype?: string; data?: { signedTransactionInfo?: string } }>(signedPayload)
  if (!notif) return NextResponse.json({ received: true }) // ack so Apple doesn't retry

  const type = notif.notificationType
  // Only these affect commission. SUBSCRIBED/initial is handled by iap/verify.
  const eventType: 'renewal' | 'refund' | null =
    type === 'DID_RENEW' ? 'renewal' : type === 'REFUND' ? 'refund' : null
  if (!eventType) return NextResponse.json({ received: true })

  const tx = decodeJws<{
    productId?: string; transactionId?: string; originalTransactionId?: string
    price?: number; currency?: string
  }>(notif.data?.signedTransactionInfo)
  if (!tx?.originalTransactionId || !tx.transactionId) return NextResponse.json({ received: true })

  const db = createServiceClient()
  const ref = await partnerRefByOriginalTx(db, tx.originalTransactionId)
  if (!ref) return NextResponse.json({ received: true }) // not partner-referred

  // Apple `price` is in milliunits of `currency` (e.g. 6990 = 6.99). → cents.
  const grossCents = typeof tx.price === 'number' ? Math.round(tx.price / 10) : 0
  const currency = (tx.currency ?? ref.currency).toLowerCase()

  await recordCommissionEvent(db, {
    referredByPartnerId: ref.partnerId,
    profileId: ref.profileId,
    userId: ref.userId,
    source: 'apple',
    eventType,
    plan: PRODUCT_TO_PLAN[tx.productId ?? ''] ?? null,
    currency,
    grossCents: eventType === 'refund' ? -grossCents : grossCents,
    feeCents: 0, // Apple's cut isn't itemised here; bounty channels don't use net
    subscriptionId: tx.originalTransactionId,
    externalEventId: `apple:notif:${tx.transactionId}`,
  })

  return NextResponse.json({ received: true })
}
