import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase-server'
import { money } from '@/lib/partner-stats'
import { sendPartnerPayoutSentEmail } from '@/lib/email'

// Admin: mark a partner's period as paid after a manual bank transfer.
// Flips that period's cleared events → paid, marks the payout paid, emails the
// partner. Body: { partner_id, period } (period = "YYYY-MM").
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const db = createServiceClient()

  const body = await req.json().catch(() => ({}))
  const partnerId = (body.partner_id ?? '').trim()
  const period = (body.period ?? '').trim()
  if (!partnerId || !period) return NextResponse.json({ error: 'partner_id and period are required' }, { status: 400 })

  const { data: partner } = await db.from('partners').select('*').eq('id', partnerId).maybeSingle()
  if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 })

  // Sum cleared (unpaid) share due for that period.
  const { data: events } = await db
    .from('commission_events')
    .select('id, share_due_cents')
    .eq('partner_id', partnerId)
    .eq('period', period)
    .eq('status', 'cleared')
  const total = (events ?? []).reduce((s, e) => s + (e.share_due_cents ?? 0), 0)

  // Flip those events to paid.
  await db.from('commission_events')
    .update({ status: 'paid' })
    .eq('partner_id', partnerId)
    .eq('period', period)
    .eq('status', 'cleared')

  // Record the payout.
  await db.from('payouts').upsert(
    { partner_id: partnerId, period, currency: partner.currency, total_cents: total, status: 'paid', paid_at: new Date().toISOString() },
    { onConflict: 'partner_id,period' },
  )

  const amountDisplay = money(total, partner.currency)
  try {
    await sendPartnerPayoutSentEmail({ to: partner.email, name: partner.name, amountDisplay, period })
  } catch (e) { console.error('[partners/payout] email failed', e) }

  return NextResponse.json({ ok: true, partner_id: partnerId, period, total_cents: total, amount: amountDisplay })
}
