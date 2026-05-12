import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = createServiceClient()

  // Try exact match first
  let { data: profile } = await db
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .single()

  // Fallback: prefix match (handles slugs with random suffixes, e.g. "nick-davchevski" → "nick-davchevski-a3bx")
  if (!profile) {
    const { data: rows } = await db
      .from('profiles')
      .select('*')
      .ilike('slug', `${slug}-%`)
      .limit(1)
    profile = rows?.[0] ?? null
  }

  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: vouches } = await db
    .from('vouches')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  const approved = vouches ?? []
  const trustScore =
    approved.length > 0
      ? Math.round((approved.reduce((s: number, v: { star_rating: number }) => s + v.star_rating, 0) / approved.length) * 10) / 10
      : 0
  const verificationRate =
    approved.length > 0
      ? Math.round((approved.filter((v: { verified: boolean }) => v.verified).length / approved.length) * 100)
      : 0

  return NextResponse.json({ profile, vouches: approved, trustScore, verificationRate })
}
