import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function PUT(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  // Verify the profile belongs to this user
  const { data: profile } = await db
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { order } = await req.json() as { order: string[] }
  if (!Array.isArray(order)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  // Update each vouch's display_order — only vouches owned by this profile
  const updates = order.map((id, index) =>
    db
      .from('vouches')
      .update({ display_order: index })
      .eq('id', id)
      .eq('profile_id', profile.id)
  )

  await Promise.all(updates)

  return NextResponse.json({ success: true })
}
