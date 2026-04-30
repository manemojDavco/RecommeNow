import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'

const SLUG_RE = /^[a-z0-9-]{3,40}$/

export async function PUT(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await req.json()
  if (!slug || !SLUG_RE.test(slug)) {
    return NextResponse.json(
      { error: 'Slug must be 3–40 lowercase letters, numbers, or hyphens.' },
      { status: 400 }
    )
  }

  const db = createServiceClient()

  const { data: profile } = await db
    .from('profiles')
    .select('id, plan')
    .eq('user_id', userId)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  if (profile.plan !== 'pro') {
    return NextResponse.json({ error: 'Custom slugs require a Pro plan.' }, { status: 403 })
  }

  // Check slug availability
  const { data: existing } = await db
    .from('profiles')
    .select('id')
    .eq('slug', slug)
    .neq('id', profile.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'That slug is already taken.' }, { status: 409 })
  }

  const { error } = await db
    .from('profiles')
    .update({ slug })
    .eq('id', profile.id)

  if (error) return NextResponse.json({ error: 'Failed to update slug.' }, { status: 500 })

  return NextResponse.json({ success: true, slug })
}
