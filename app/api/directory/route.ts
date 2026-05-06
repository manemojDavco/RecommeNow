import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')?.trim() ?? ''
  const industry = searchParams.get('industry')?.trim() ?? ''
  const remote = searchParams.get('remote')?.trim() ?? ''
  const location = searchParams.get('location')?.trim() ?? ''
  const sort = searchParams.get('sort') ?? 'vouches'
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '0', 10))
  const limit = 24

  const db = createServiceClient()

  let query = db
    .from('public_directory')
    .select('*')
    .range(page * limit, page * limit + limit - 1)

  if (search) {
    query = query.or(`name.ilike.%${search}%,title.ilike.%${search}%`)
  }
  if (industry) {
    query = query.contains('industries', [industry])
  }
  if (remote) {
    query = query.eq('remote_preference', remote)
  }
  if (location) {
    query = query.ilike('location', `%${location}%`)
  }

  if (sort === 'verified') {
    query = query.order('verification_rate', { ascending: false })
  } else if (sort === 'name') {
    query = query.order('name', { ascending: true })
  } else if (sort === 'location') {
    query = query.order('location', { ascending: true, nullsFirst: false })
  } else {
    query = query.order('vouch_count', { ascending: false })
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch top quote for each profile (most recent approved vouch)
  const profiles = data ?? []
  if (profiles.length > 0) {
    const profileIds = profiles.map((p: { id: string }) => p.id)
    const { data: quotes } = await db
      .from('vouches')
      .select('profile_id, quote')
      .in('profile_id', profileIds)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    const topQuoteMap: Record<string, string> = {}
    for (const q of quotes ?? []) {
      if (!topQuoteMap[q.profile_id]) topQuoteMap[q.profile_id] = q.quote
    }

    return NextResponse.json({
      profiles: profiles.map((p: { id: string; bio?: string | null }) => ({
        ...p,
        top_quote: topQuoteMap[p.id] ?? null,
      }))
    })
  }

  return NextResponse.json({ profiles })
}
