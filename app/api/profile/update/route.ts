import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function PUT(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const body = await req.json()

  const { title, years_experience, location, remote_preference, availability, bio, industries, stages } = body

  const { data: profile, error } = await db
    .from('profiles')
    .update({
      ...(title !== undefined ? { title: title?.trim() || null } : {}),
      ...(years_experience !== undefined ? { years_experience: years_experience?.trim() || null } : {}),
      ...(location !== undefined ? { location: location?.trim() || null } : {}),
      ...(remote_preference !== undefined ? { remote_preference: remote_preference || null } : {}),
      ...(availability !== undefined ? { availability: availability || null } : {}),
      ...(bio !== undefined ? { bio: bio?.trim() || null } : {}),
      ...(industries !== undefined ? { industries } : {}),
      ...(stages !== undefined ? { stages } : {}),
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 })
  }

  return NextResponse.json({ profile })
}
