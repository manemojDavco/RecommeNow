import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function PUT(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const body = await req.json()

  const { name, title, years_experience, location, remote_preference, availability, bio, industries, stages, phone, linkedin_url, photo_url, contact_email, show_phone, show_linkedin, show_contact_email, show_working_pref, show_availability } = body

  const { data: profile, error } = await db
    .from('profiles')
    .update({
      ...(name !== undefined && name?.trim() ? { name: name.trim() } : {}),
      ...(photo_url !== undefined ? { photo_url } : {}),
      ...(title !== undefined ? { title: title?.trim() || null } : {}),
      ...(years_experience !== undefined ? { years_experience: years_experience?.trim() || null } : {}),
      ...(location !== undefined ? { location: location?.trim() || null } : {}),
      ...(remote_preference !== undefined ? { remote_preference: remote_preference || null } : {}),
      ...(availability !== undefined ? { availability: availability || null } : {}),
      ...(bio !== undefined ? { bio: bio?.trim() || null } : {}),
      ...(industries !== undefined ? { industries } : {}),
      ...(stages !== undefined ? { stages } : {}),
      ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
      ...(linkedin_url !== undefined ? { linkedin_url: linkedin_url?.trim() || null } : {}),
      ...(contact_email !== undefined ? { contact_email: contact_email?.trim() || null } : {}),
      ...(show_phone !== undefined ? { show_phone: Boolean(show_phone) } : {}),
      ...(show_linkedin !== undefined ? { show_linkedin: Boolean(show_linkedin) } : {}),
      ...(show_contact_email !== undefined ? { show_contact_email: Boolean(show_contact_email) } : {}),
      ...(show_working_pref !== undefined ? { show_working_pref: Boolean(show_working_pref) } : {}),
      ...(show_availability !== undefined ? { show_availability: Boolean(show_availability) } : {}),
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: `Failed to update profile: ${error.message}${error.code ? ` (${error.code})` : ''}` }, { status: 500 })
  }

  return NextResponse.json({ profile })
}
