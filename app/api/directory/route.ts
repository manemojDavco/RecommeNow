import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')?.trim() ?? ''
  const industry = searchParams.get('industry')?.trim() ?? ''
  const remote = searchParams.get('remote')?.trim() ?? ''
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

  if (sort === 'trust') {
    query = query.order('trust_score', { ascending: false })
  } else {
    query = query.order('vouch_count', { ascending: false })
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ profiles: data ?? [] })
}
