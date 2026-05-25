import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const status = req.nextUrl.searchParams.get('status')

  const { data: profile } = await db
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  let query = db
    .from('vouches')
    .select('*')
    .eq('profile_id', profile.id)

  if (status) query = query.eq('status', status)

  // Approved vouches respect the manual drag-and-drop order (display_order nulls last),
  // everything else falls back to newest-first.
  if (status === 'approved') {
    query = query
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: vouches } = await query
  return NextResponse.json({ vouches: vouches ?? [] })
}
