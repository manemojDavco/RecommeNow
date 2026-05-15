// Upload a profile photo from the mobile app.
// Accepts a base64-encoded image (JSON body), uploads to Supabase Storage
// avatars bucket, updates profile.photo_url, and returns the public URL.
// Also accepts multipart/form-data for the web dashboard.
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  let buffer: Buffer
  let contentType: string
  let ext: string

  const ct = req.headers.get('content-type') ?? ''

  if (ct.includes('application/json')) {
    // ── Mobile path: base64 JSON body ──────────────────────────────────────
    const body = await req.json()
    const { image, contentType: imgType } = body
    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'Missing image data.' }, { status: 400 })
    }
    buffer = Buffer.from(image, 'base64')
    contentType = imgType ?? 'image/jpeg'
    ext = contentType === 'image/png' ? 'png' : 'jpg'
  } else {
    // ── Web path: multipart form-data ───────────────────────────────────────
    const formData = await req.formData()
    const file = formData.get('photo') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Must be an image.' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Max 5 MB.' }, { status: 400 })
    buffer = Buffer.from(await file.arrayBuffer())
    contentType = file.type
    ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  }

  const path = `${userId}/avatar.${ext}`

  const { error: uploadError } = await db.storage
    .from('avatars')
    .upload(path, buffer, { contentType, upsert: true })

  if (uploadError) {
    console.error('Photo upload error:', uploadError)
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 })
  }

  const { data: { publicUrl } } = db.storage.from('avatars').getPublicUrl(path)
  // Cache-buster so UI sees the new image immediately
  const photo_url = `${publicUrl}?t=${Date.now()}`

  await db.from('profiles').update({ photo_url }).eq('user_id', userId)

  return NextResponse.json({ photo_url, url: photo_url })
}
