// Returns the signed-in user's own profile.
// Called by the mobile app — authenticated via Clerk Bearer token.
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const { data: profile } = await db
    .from('profiles')
    .select('id, slug, name, title, location, bio, photo_url, plan, linkedin_url')
    .eq('user_id', userId)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  return NextResponse.json({ profile })
}
