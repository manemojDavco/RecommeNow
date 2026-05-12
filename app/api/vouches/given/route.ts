// Returns vouches this user has GIVEN to other profiles.
// Matches on giver_email from the authenticated user's Clerk account.
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get the user's primary email from Clerk
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress
  if (!email) return NextResponse.json({ error: 'Could not determine user email' }, { status: 400 })

  const db = createServiceClient()

  const { data: vouches, error } = await db
    .from('vouches')
    .select(`
      id,
      giver_name,
      giver_title,
      giver_company,
      giver_relationship,
      traits,
      quote,
      star_rating,
      verified,
      status,
      created_at,
      profiles!inner(name, slug, title)
    `)
    .eq('giver_email', email)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Given vouches error:', error)
    return NextResponse.json({ error: 'Failed to fetch given vouches' }, { status: 500 })
  }

  return NextResponse.json({ vouches: vouches ?? [] })
}
