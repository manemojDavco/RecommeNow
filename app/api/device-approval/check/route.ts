// Called by middleware after every sign-in to check if device verification is needed.
// Returns { required: false } or { required: true, token: string }
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase-server'
import { sendPushNotification } from '@/lib/push'

function getDeviceLabel(userAgent: string): string {
  if (/iPhone/i.test(userAgent)) return 'iPhone'
  if (/iPad/i.test(userAgent)) return 'iPad'
  if (/Android/i.test(userAgent)) return 'Android device'
  if (/Macintosh/i.test(userAgent)) return 'Mac'
  if (/Windows/i.test(userAgent)) return 'Windows PC'
  return 'New device'
}

export async function GET(req: NextRequest) {
  const { userId, sessionId } = await auth()
  if (!userId || !sessionId) return NextResponse.json({ required: false })

  // If already verified this session via cookie, skip
  const verified = req.cookies.get(`verified_session_${sessionId}`)?.value
  if (verified === '1') return NextResponse.json({ required: false })

  const db = createServiceClient()
  const { data: profile } = await db
    .from('profiles')
    .select('id, push_token')
    .eq('user_id', userId)
    .single()

  // No profile or no push token = no verification needed
  if (!profile || !(profile as any).push_token) return NextResponse.json({ required: false })

  const pushToken = (profile as any).push_token

  // Check for existing approval for this session
  const { data: existing } = await db
    .from('device_approvals')
    .select('id, status, token')
    .eq('session_id', sessionId)
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing?.status === 'approved') return NextResponse.json({ required: false })
  if (existing?.status === 'pending') {
    return NextResponse.json({ required: true, token: existing.token })
  }

  // Create new approval
  const userAgent = req.headers.get('user-agent') ?? ''
  const deviceLabel = getDeviceLabel(userAgent)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const { data: approval } = await db
    .from('device_approvals')
    .insert({
      profile_id: profile.id,
      session_id: sessionId,
      status: 'pending',
      device_info: { user_agent: userAgent, device_label: deviceLabel },
      expires_at: expiresAt,
    })
    .select('token')
    .single()

  if (!approval?.token) return NextResponse.json({ required: false })

  // Send push notification
  await sendPushNotification({
    to: pushToken,
    title: 'New sign-in to your account',
    body: `${deviceLabel} is trying to sign in. Tap to approve or deny.`,
    data: { screen: 'device_approval', token: String(approval.token), device: deviceLabel },
  }).catch(console.error)

  return NextResponse.json({ required: true, token: approval.token })
}
