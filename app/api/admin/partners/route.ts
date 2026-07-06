import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase-server'
import { defaultConfig, type PartnerType, type PartnerCurrency } from '@/lib/partners'
import { nanoid } from 'nanoid'

// Admin: create and list partners. Commission config is seeded from the
// per-(type × currency) defaults but can be overridden per partner.

const TYPES: PartnerType[] = ['recruiter', 'influencer', 'student']
const CURRENCIES: PartnerCurrency[] = ['usd', 'aud', 'gbp', 'eur']

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const db = createServiceClient()
  const { data, error } = await db
    .from('partners')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ partners: data ?? [] })
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const db = createServiceClient()

  const body = await req.json().catch(() => ({}))
  const name = (body.name ?? '').trim()
  const email = (body.email ?? '').trim().toLowerCase()
  const partner_type = body.partner_type as PartnerType
  const currency = (body.currency ?? 'usd') as PartnerCurrency

  if (!name || !email) return NextResponse.json({ error: 'name and email are required' }, { status: 400 })
  if (!TYPES.includes(partner_type)) return NextResponse.json({ error: 'invalid partner_type' }, { status: 400 })
  if (!CURRENCIES.includes(currency)) return NextResponse.json({ error: 'invalid currency' }, { status: 400 })

  const cfg = defaultConfig(partner_type, currency)
  // A short, human-typeable, collision-resistant code (or caller-supplied).
  const code = (body.code ?? '').trim() || `${partner_type.slice(0, 3)}-${nanoid(6)}`.toLowerCase()

  const { data, error } = await db
    .from('partners')
    .insert({
      name,
      email,
      code,
      partner_type,
      currency,
      share_pct:    body.share_pct    ?? cfg.share_pct,
      share_months: body.share_months ?? cfg.share_months,
      bounty_cents: body.bounty_cents ?? cfg.bounty_cents,
      status: body.status ?? 'active',
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That code is already taken' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ partner: data })
}
