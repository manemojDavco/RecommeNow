import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  // Get the current user's email from their profile's Clerk user
  const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  })
  if (!clerkRes.ok) return NextResponse.json({ vouches: [] })

  const clerkUser = await clerkRes.json()
  const email = clerkUser.email_addresses?.find(
    (e: { id: string }) => e.id === clerkUser.primary_email_address_id
  )?.email_address

  if (!email) return NextResponse.json({ vouches: [] })

  // Find vouches given by this email, join with profile name/slug
  const { data: vouches } = await db
    .from('vouches')
    .select('id, profile_id, quote, traits, giver_relationship, verified, created_at, profiles!inner(name, slug)')
    .eq('giver_email', email.toLowerCase())
    .order('created_at', { ascending: false })

  const formatted = (vouches ?? []).map((v: {
    id: string
    profile_id: string
    quote: string
    traits: string[]
    giver_relationship: string | null
    verified: boolean
    created_at: string
    profiles: { name: string; slug: string } | { name: string; slug: string }[]
  }) => {
    // Supabase may return the joined relation as an array or a single object
    const profile = Array.isArray(v.profiles) ? v.profiles[0] : v.profiles
    return {
      id: v.id,
      profile_id: v.profile_id,
      profile_name: profile?.name ?? '',
      profile_slug: profile?.slug ?? '',
      quote: v.quote,
      traits: v.traits,
      giver_relationship: v.giver_relationship,
      verified: v.verified,
      created_at: v.created_at,
    }
  })

  return NextResponse.json({ vouches: formatted })
}
