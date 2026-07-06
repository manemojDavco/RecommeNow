import type { SupabaseClient } from '@supabase/supabase-js'
import { money } from './partner-stats'
import { sendPartnerWelcomeEmail, sendPartnerFirstSignupEmail } from './email'

export type PartnerRowLite = {
  id: string
  name: string
  email: string
  code: string
  partner_type: string
  currency: string
  share_pct: number
  share_months: number
  bounty_cents: number
}

// One-line description of a partner's deal, for emails.
export function dealLine(p: PartnerRowLite): string {
  if (p.partner_type === 'recruiter') {
    return `You earn ${p.share_pct}% of net revenue for ${p.share_months} months on every referred subscription, plus 50% off your own seats.`
  }
  return `You earn ${money(p.bounty_cents, p.currency)} per paid conversion.`
}

// Send the welcome email once, on partner creation/approval. Never throws.
export async function notifyPartnerWelcome(db: SupabaseClient, partner: PartnerRowLite): Promise<void> {
  try {
    await sendPartnerWelcomeEmail({ to: partner.email, name: partner.name, code: partner.code, dealLine: dealLine(partner) })
    await db.from('partners').update({ welcomed_at: new Date().toISOString() }).eq('id', partner.id)
  } catch (e) {
    console.error('[partner-notify] welcome failed:', e)
  }
}

// Send the "first referral signed up" email once per partner. Never throws.
export async function notifyPartnerFirstSignup(db: SupabaseClient, partnerId: string): Promise<void> {
  try {
    const { data: partner } = await db
      .from('partners')
      .select('id, name, email, first_signup_notified_at')
      .eq('id', partnerId)
      .maybeSingle()
    if (!partner || partner.first_signup_notified_at) return
    await sendPartnerFirstSignupEmail({ to: partner.email, name: partner.name })
    await db.from('partners').update({ first_signup_notified_at: new Date().toISOString() }).eq('id', partnerId)
  } catch (e) {
    // Column may not be migrated yet, or email failed — non-fatal.
    console.error('[partner-notify] firstSignup failed:', e)
  }
}
