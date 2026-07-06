import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { runPartnerClearing, runPartnerNotify, runPartnerStatements } from '@/lib/partner-jobs'

// Single daily partner cron (keeps us within the platform cron limit).
//   - clearing: mark events cleared after 30 days, compute share_due
//   - notify:   digest / milestone / inactivity emails
//   - statements: only on the 1st of the month (monthly statement + draft payout)
// Auth: Bearer CRON_SECRET.
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const clearing = await runPartnerClearing(db)
  const notify = await runPartnerNotify(db)
  const isFirstOfMonth = new Date().getUTCDate() === 1
  const statements = isFirstOfMonth ? await runPartnerStatements(db) : null

  return NextResponse.json({ ok: true, clearing, notify, statements })
}
