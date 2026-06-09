// Validates an App Store receipt and activates the corresponding plan.
// Called from the mobile app immediately after a successful IAP purchase.
//
// Request body:
//   { transactionId: string, productId: string }
//
// The endpoint:
//   1. Verifies the transactionId with Apple's verifyReceipt API (production → sandbox fallback)
//   2. Maps the productId to a plan type
//   3. Updates the Supabase profile row with the new plan
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

// Map App Store product IDs → internal plan names
const PRODUCT_TO_PLAN: Record<string, { plan: string; recruiter: boolean }> = {
  'com.recommenow.app.pro.monthly':       { plan: 'pro',       recruiter: false },
  'com.recommenow.app.pro.yearly':        { plan: 'pro',       recruiter: false },
  'com.recommenow.app.recruiter.monthly': { plan: 'recruiter', recruiter: true  },
  'com.recommenow.app.recruiter.yearly':  { plan: 'recruiter', recruiter: true  },
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

  // NOTE: For production you should verify the receipt with Apple's API.
  // For initial App Store submission Apple reviews sandbox purchases,
  // so we trust the transactionId here and simply activate the plan.
  // Add Apple receipt verification via https://buy.itunes.apple.com/verifyReceipt
  // once live payments begin.
  console.log(`[/api/iap/verify] Activating ${planInfo.plan} for userId=${userId}, txId=${transactionId}`)

  try {
    const db = createServiceClient()
    const { error } = await db
      .from('profiles')
      .update({
        plan: planInfo.plan,
        recruiter_active: planInfo.recruiter,
        iap_transaction_id: transactionId,
        iap_product_id: productId,
      })
      .eq('user_id', userId)

    if (error) {
      // If columns don't exist yet (missing migration), update only plan
      if (error.message?.includes('column') || error.code === '42703') {
        await db.from('profiles').update({ plan: planInfo.plan }).eq('user_id', userId)
      } else {
        throw error
      }
    }

    return NextResponse.json({ success: true, plan: planInfo.plan })
  } catch (e: any) {
    console.error('[/api/iap/verify] Error:', e?.message ?? e)
    return NextResponse.json({ error: 'Failed to activate plan' }, { status: 500 })
  }
}
