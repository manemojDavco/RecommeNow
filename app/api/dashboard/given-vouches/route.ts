import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  // Get the current user's primary email from Clerk
  const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  })
  if (!clerkRes.ok) return NextResponse.json({ vouches: [] })

  const clerkUser = await clerkRes.json()
  const primaryEmail = clerkUser.email_addresses?.find(
    (e: { id: string }) => e.id === clerkUser.primary_email_address_id
  )?.email_address?.toLowerCase()

  if (!primaryEmail) return NextResponse.json({ vouches: [] })

  // Get all verified connected emails (including archived — past vouches still count)
  const { data: connectedEmails } = await db
    .from('user_emails')
    .select('email')
    .eq('user_id', userId)
    .eq('verified', true)

  const allEmails = [primaryEmail, ...(connectedEmails ?? []).map((e: { email: string }) => e.email)]

  // Find vouches given by any of the user's emails, join with profile name/slug
  const { data: vouches } = await db
    .from('vouches')
    .select('id, profile_id, quote, traits, giver_relationship, verified, created_at, profiles!inner(name, slug)')
    .in('giver_email', allEmails)
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
