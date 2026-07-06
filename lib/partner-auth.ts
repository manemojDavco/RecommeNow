import { auth, currentUser } from '@clerk/nextjs/server'
import { createServiceClient } from './supabase-server'
import type { PartnerType, PartnerCurrency } from './partners'

export type PartnerRow = {
  id: string
  name: string
  email: string
  code: string
  partner_type: PartnerType
  currency: PartnerCurrency
  share_pct: number
  share_months: number
  bounty_cents: number
  status: string
  user_id: string | null
  created_at: string
}

/**
 * Resolve the partner for the signed-in Clerk user. Matches on the linked
 * `user_id` first; otherwise on email (case-insensitive) and links the user_id
 * so subsequent loads are a direct lookup. Returns null if not a partner.
 */
export async function getPartnerForCurrentUser(): Promise<PartnerRow | null> {
  const { userId } = await auth()
  if (!userId) return null
  const db = createServiceClient()

  const { data: byId } = await db.from('partners').select('*').eq('user_id', userId).maybeSingle()
  if (byId) return byId as PartnerRow

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase()
  if (!email) return null

  const { data: byEmail } = await db.from('partners').select('*').ilike('email', email).maybeSingle()
  if (!byEmail) return null

  await db.from('partners').update({ user_id: userId }).eq('id', byEmail.id)
  return { ...(byEmail as PartnerRow), user_id: userId }
}
