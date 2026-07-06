import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { runPartnerClearing } from '@/lib/partner-jobs'

// Manual/independent trigger for the clearing job (also run by partner-daily).
// Auth: Bearer CRON_SECRET.
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const result = await runPartnerClearing(createServiceClient())
  return NextResponse.json({ ok: true, ...result })
}
