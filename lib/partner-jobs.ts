import type { SupabaseClient } from '@supabase/supabase-js'
import { computeShareDue, periodOf } from './partners'
import { computePartnerStats, money } from './partner-stats'
import {
  sendPartnerConversionsDigestEmail,
  sendPartnerMilestoneEmail,
  sendPartnerInactivityEmail,
  sendPartnerStatementEmail,
} from './email'

// All partner background jobs live here so a single daily cron can run them
// (keeps us within the platform's cron limit). Each is independently callable.

const MILESTONES = [10, 50, 100, 250, 500]

// Clear pending commission events past their 30-day window; compute share_due.
export async function runPartnerClearing(db: SupabaseClient): Promise<{ scanned: number; cleared: number }> {
  const nowIso = new Date().toISOString()
  const { data: events } = await db
    .from('commission_events')
    .select('id, partner_id, subscription_id, event_type, net_cents, occurred_at, partners(share_pct, share_months, bounty_cents)')
    .eq('status', 'pending')
    .lte('clear_at', nowIso)
    .limit(1000)

  type Cfg = { share_pct: number; share_months: number; bounty_cents: number }
  const firstPaidCache = new Map<string, string | null>()
  let cleared = 0
  for (const ev of events ?? []) {
    const raw = (ev as { partners: Cfg | Cfg[] | null }).partners
    const partner = Array.isArray(raw) ? raw[0] : raw
    if (!partner) continue

    let firstPaidAt: string | null = null
    if ((partner.share_pct ?? 0) > 0 && ev.subscription_id) {
      if (firstPaidCache.has(ev.subscription_id)) firstPaidAt = firstPaidCache.get(ev.subscription_id) ?? null
      else {
        const { data: first } = await db
          .from('commission_events')
          .select('occurred_at')
          .eq('partner_id', ev.partner_id)
          .eq('subscription_id', ev.subscription_id)
          .order('occurred_at', { ascending: true })
          .limit(1)
          .maybeSingle()
        firstPaidAt = first?.occurred_at ?? ev.occurred_at
        firstPaidCache.set(ev.subscription_id, firstPaidAt)
      }
    }

    const shareDue = computeShareDue(
      partner,
      { event_type: ev.event_type as 'conversion' | 'renewal' | 'refund', net_cents: ev.net_cents, occurred_at: ev.occurred_at },
      firstPaidAt,
    )
    const { error } = await db.from('commission_events').update({ status: 'cleared', share_due_cents: shareDue }).eq('id', ev.id)
    if (!error) cleared++
  }
  return { scanned: events?.length ?? 0, cleared }
}

// Daily partner emails: digest (#3), milestone (#7), inactivity nudge (#6).
export async function runPartnerNotify(db: SupabaseClient): Promise<{ digests: number; milestones: number; nudges: number }> {
  const now = Date.now()
  const dayAgo = new Date(now - 24 * 3600 * 1000)
  const monthAgoIso = new Date(now - 30 * 24 * 3600 * 1000).toISOString()

  const { data: partners } = await db.from('partners').select('*').eq('status', 'active').limit(2000)
  const { data: convs } = await db
    .from('commission_events').select('partner_id, created_at').eq('event_type', 'conversion').limit(50000)
  const { data: profiles } = await db
    .from('profiles').select('referred_by_partner_id, referred_at').not('referred_by_partner_id', 'is', null).limit(50000)

  const totalConv = new Map<string, number>()
  for (const c of convs ?? []) totalConv.set(c.partner_id, (totalConv.get(c.partner_id) ?? 0) + 1)
  const recentSignups = new Map<string, number>()
  for (const pr of profiles ?? []) {
    if (pr.referred_at && pr.referred_at > monthAgoIso) recentSignups.set(pr.referred_by_partner_id, (recentSignups.get(pr.referred_by_partner_id) ?? 0) + 1)
  }

  let digests = 0, milestones = 0, nudges = 0
  for (const p of partners ?? []) {
    const since = p.last_digest_at ? new Date(p.last_digest_at) : dayAgo
    const newCount = (convs ?? []).filter(c => c.partner_id === p.id && c.created_at && new Date(c.created_at) > since).length
    if (newCount > 0) {
      try {
        await sendPartnerConversionsDigestEmail({ to: p.email, name: p.name, count: newCount })
        await db.from('partners').update({ last_digest_at: new Date().toISOString() }).eq('id', p.id)
        digests++
      } catch (e) { console.error('[partner-jobs] digest', p.id, e) }
    }

    const total = totalConv.get(p.id) ?? 0
    const crossed = MILESTONES.filter(m => m <= total && m > (p.last_milestone ?? 0)).pop()
    if (crossed) {
      try {
        await sendPartnerMilestoneEmail({ to: p.email, name: p.name, milestone: crossed })
        await db.from('partners').update({ last_milestone: crossed }).eq('id', p.id)
        milestones++
      } catch (e) { console.error('[partner-jobs] milestone', p.id, e) }
    }

    if (p.partner_type !== 'recruiter') {
      const olderThan30d = p.created_at && new Date(p.created_at).getTime() < now - 30 * 24 * 3600 * 1000
      const noRecent = (recentSignups.get(p.id) ?? 0) === 0
      const notNudgedRecently = !p.last_nudge_at || new Date(p.last_nudge_at).getTime() < now - 30 * 24 * 3600 * 1000
      if (olderThan30d && noRecent && notNudgedRecently) {
        try {
          await sendPartnerInactivityEmail({ to: p.email, name: p.name })
          await db.from('partners').update({ last_nudge_at: new Date().toISOString() }).eq('id', p.id)
          nudges++
        } catch (e) { console.error('[partner-jobs] nudge', p.id, e) }
      }
    }
  }
  return { digests, milestones, nudges }
}

// Monthly statement (#4): email last month's summary + upsert a draft payout.
export async function runPartnerStatements(db: SupabaseClient): Promise<{ period: string; statements: number }> {
  const d = new Date()
  const period = periodOf(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1)))
  const { data: partners } = await db.from('partners').select('*').eq('status', 'active').limit(2000)

  let sent = 0
  for (const p of partners ?? []) {
    if (p.created_at && periodOf(p.created_at) > period) continue
    const stats = await computePartnerStats(db, p.id)
    const row = stats.by_period.find(r => r.period === period)
      ?? { period, signups: 0, conversions: 0, cleared_net_cents: 0, share_due_cents: 0 }
    const isRecruiter = p.partner_type === 'recruiter'
    try {
      await sendPartnerStatementEmail({
        to: p.email, name: p.name, period,
        signups: row.signups, conversions: row.conversions,
        clearedDisplay: isRecruiter ? money(row.cleared_net_cents, p.currency) : String(row.conversions),
        dueDisplay: money(row.share_due_cents, p.currency),
        isRecruiter,
      })
      sent++
    } catch (e) { console.error('[partner-jobs] statement', p.id, e) }
    try {
      await db.from('payouts').upsert(
        { partner_id: p.id, period, currency: p.currency, total_cents: row.share_due_cents, status: 'draft' },
        { onConflict: 'partner_id,period' },
      )
    } catch (e) { console.error('[partner-jobs] payout upsert', p.id, e) }
  }
  return { period, statements: sent }
}
