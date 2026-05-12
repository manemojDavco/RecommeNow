// Stores/updates the Expo push token for the authenticated user.
// Called by the mobile app on every launch after sign-in.
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = await req.json()
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'token is required' }, { status: 400 })
  }

  const db = createServiceClient()

  const { error } = await db
    .from('profiles')
    .update({ push_token: token })
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: 'Failed to save token' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
