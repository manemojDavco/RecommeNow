import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

// Called daily by Vercel Cron (see vercel.json).
// Resets plan → 'free' for any PRO trial that has expired and has no active
// Stripe subscription. The DB function returns the number of expired rows.
export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()
  const { data, error } = await db.rpc('expire_pro_trials')

  if (error) {
    console.error('expire_pro_trials error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const expired = data as number
  console.log(`[cron/expire-trials] expired ${expired} trial(s)`)
  return NextResponse.json({ ok: true, expired })
}
