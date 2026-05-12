// Returns all vouches for the authenticated user's profile (all statuses).
// Used by the mobile app to display the vouch management screen.
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  const { data: profile } = await db
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { data: vouches, error } = await db
    .from('vouches')
    .select('id, giver_name, giver_title, giver_company, giver_relationship, traits, quote, star_rating, verified, status, created_at')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch vouches' }, { status: 500 })

  return NextResponse.json({ vouches: vouches ?? [] })
}
