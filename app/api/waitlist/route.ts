import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const { data: inserted, error } = await db
    .from('waitlist')
    .insert({ email: email.toLowerCase().trim() })
    .select('position')
    .single()

  if (error) {
    if (error.code === '23505') {
      // Already on the list — look up their position
      const { data: existing } = await db
        .from('waitlist')
        .select('position')
        .eq('email', email.toLowerCase().trim())
        .single()
      return NextResponse.json({
        ok: true,
        alreadyRegistered: true,
        position: existing?.position ?? null,
        earlyAccess: (existing?.position ?? 999) <= 100,
      })
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }

  const position = inserted?.position ?? null
  return NextResponse.json({
    ok: true,
    position,
    earlyAccess: position !== null && position <= 100,
  })
}
