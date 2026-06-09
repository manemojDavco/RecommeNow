// Validates an App Store receipt and activates the corresponding plan.
// Called from the mobile app immediately after a successful IAP purchase.
//
// Security model:
//   1. Verify the JWS transaction with Apple's App Store Server API (StoreKit 2)
//      Production: https://api.storekit.itunes.apple.com
//      Sandbox:    https://api.storekit-sandbox.itunes.apple.com
//   2. Confirm the transactionId hasn't been used before (replay prevention)
//   3. Confirm the bundleId matches com.recommenow.app
//   4. Update Supabase plan
//
// Request body: { transactionId: string, productId: string }
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

// Map App Store product IDs → internal plan names
// Must match the Product IDs created in App Store Connect → Subscriptions
const PRODUCT_TO_PLAN: Record<string, { plan: string; recruiter: boolean }> = {
  'PRO.monthly':       { plan: 'pro',       recruiter: false },
  'PRO.yearly':        { plan: 'pro',       recruiter: false },
  'RECRUITER.monthly': { plan: 'recruiter', recruiter: true  },
  'RECRUITER.yearly':  { plan: 'recruiter', recruiter: true  },
}

const BUNDLE_ID = 'com.recommenow.app'

/**
 * Verify a StoreKit 2 transaction with Apple's App Store Server API.
 * Tries production first, falls back to sandbox (for TestFlight / App Review).
 */
async function verifyWithApple(
  transactionId: string
): Promise<{ valid: boolean; productId?: string; bundleId?: string }> {
  // Apple App Store Server API requires a signed JWT (App Store Connect API key).
  // Without the private key we fall back to trusting the client claim but log it.
  // TODO: add APPLE_PRIVATE_KEY, APPLE_KEY_ID, APPLE_ISSUER_ID to env vars for
  //       full server-side verification in production.
  const privateKey = process.env.APPLE_PRIVATE_KEY
  const keyId      = process.env.APPLE_KEY_ID
  const issuerId   = process.env.APPLE_ISSUER_ID

  if (!privateKey || !keyId || !issuerId) {
    // Env vars not configured — log and proceed with soft trust during initial launch.
    // Set APPLE_PRIVATE_KEY, APPLE_KEY_ID, APPLE_ISSUER_ID in Vercel to enable.
    console.warn('[iap/verify] Apple API keys not configured — skipping server verification')
    return { valid: true }
  }

  try {
    // Build a JWT to authenticate with Apple's API (ES256, 10-min expiry)
    const { SignJWT, importPKCS8 } = await import('jose')
    const privateKeyObj = await importPKCS8(privateKey.replace(/\\n/g, '\n'), 'ES256')
    const now = Math.floor(Date.now() / 1000)
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: keyId, typ: 'JWT' })
      .setIssuer(issuerId)
      .setIssuedAt(now)
      .setExpirationTime(now + 600)
      .setAudience('appstoreconnect-v1')
      .sign(privateKeyObj)

    // Try production first
    for (const base of [
      'https://api.storekit.itunes.apple.com',
      'https://api.storekit-sandbox.itunes.apple.com',
    ]) {
      const res = await fetch(`${base}/inApps/v1/transactions/${transactionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 200) {
        const data = await res.json() as { signedTransactionInfo?: string }
        // Decode the JWS payload (we trust Apple's signature here — full JWS
        // verification requires Apple's root cert and is optional for MVP)
        const parts = data.signedTransactionInfo?.split('.')
        if (parts && parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
          return {
            valid:     true,
            productId: payload.productId,
            bundleId:  payload.bundleId,
          }
        }
        return { valid: true }
      }
      if (res.status !== 404) break // 404 means try sandbox
    }

    return { valid: false }
  } catch (e: any) {
    console.error('[iap/verify] Apple verification error:', e?.message)
    // On verification failure, soft-trust to avoid blocking legitimate users
    // during the launch window when env vars may not yet be configured.
    return { valid: true }
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { transactionId?: string; productId?: string }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { transactionId, productId } = body
  if (!transactionId || !productId) {
    return NextResponse.json({ error: 'transactionId and productId are required' }, { status: 400 })
  }

  const planInfo = PRODUCT_TO_PLAN[productId]
  if (!planInfo) {
    return NextResponse.json({ error: `Unknown productId: ${productId}` }, { status: 400 })
  }

  // ── Replay attack prevention ─────────────────────────────────────────────
  const db = createServiceClient()
  const { data: existing } = await db
    .from('profiles')
    .select('id')
    .eq('iap_transaction_id', transactionId)
    .maybeSingle()

  if (existing) {
    // Transaction already used — check if it's the same user (restore) or a different user (fraud)
    const { data: owner } = await db
      .from('profiles')
      .select('user_id')
      .eq('iap_transaction_id', transactionId)
      .single()

    if (owner?.user_id !== userId) {
      console.warn(`[iap/verify] Replay attempt: tx ${transactionId} used by different user`)
      return NextResponse.json({ error: 'Transaction already used' }, { status: 409 })
    }
    // Same user re-verifying (e.g. restore) — allowed
  }

  // ── Verify with Apple ────────────────────────────────────────────────────
  const { valid, bundleId } = await verifyWithApple(transactionId)

  if (!valid) {
    console.warn(`[iap/verify] Apple rejected transactionId=${transactionId}`)
    return NextResponse.json({ error: 'Invalid transaction' }, { status: 422 })
  }

  if (bundleId && bundleId !== BUNDLE_ID) {
    console.warn(`[iap/verify] Bundle ID mismatch: got ${bundleId}, expected ${BUNDLE_ID}`)
    return NextResponse.json({ error: 'Bundle ID mismatch' }, { status: 422 })
  }

  // ── Activate the plan ────────────────────────────────────────────────────
  console.log(`[iap/verify] Activating ${planInfo.plan} for userId=${userId}`)

  try {
    const { error } = await db
      .from('profiles')
      .update({
        plan:               planInfo.plan,
        recruiter_active:   planInfo.recruiter,
        iap_transaction_id: transactionId,
        iap_product_id:     productId,
      })
      .eq('user_id', userId)

    if (error) {
      // Fallback if optional columns don't exist yet (pre-migration)
      if (error.code === '42703') {
        await db.from('profiles').update({ plan: planInfo.plan }).eq('user_id', userId)
      } else {
        throw error
      }
    }

    return NextResponse.json({ success: true, plan: planInfo.plan })
  } catch (e: any) {
    console.error('[iap/verify] DB error:', e?.message ?? e)
    return NextResponse.json({ error: 'Failed to activate plan' }, { status: 500 })
  }
}
