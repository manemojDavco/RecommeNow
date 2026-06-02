// Returns vouches this user has GIVEN to other profiles.
// Matches on giver_email across the user's primary email + all verified connected emails.
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  const primaryEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase()
  if (!primaryEmail) return NextResponse.json({ error: 'Could not determine user email' }, { status: 400 })

  const db = createServiceClient()

  // Get all verified connected emails (including archived — past vouches still count)
  const { data: connectedEmails } = await db
    .from('user_emails')
    .select('email')
    .eq('user_id', userId)
    .eq('verified', true)

  const allEmails = [primaryEmail, ...(connectedEmails ?? []).map((e: { email: string }) => e.email)]

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
      giver_email,
      profiles!inner(name, slug, title)
    `)
    .in('giver_email', allEmails)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Given vouches error:', error)
    return NextResponse.json({ error: 'Failed to fetch given vouches' }, { status: 500 })
  }

  return NextResponse.json({ vouches: vouches ?? [] })
}
