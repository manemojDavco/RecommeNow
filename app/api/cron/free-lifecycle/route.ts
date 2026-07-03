import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { FREE_REMINDER_DAYS } from '@/lib/plans'
import { sendFreeExpiryReminderEmail } from '@/lib/email'
import { sendPushNotification } from '@/lib/push'

// Daily Vercel cron (see vercel.json). For non-grandfathered FREE accounts:
//   • sends 10/5/1-day pre-expiry reminders (email + push, once each), and
//   • closes accounts whose free month has ended without a subscription.
// A closed account is a SOFT close — the public profile 404s (see the public
// profile route) but no data is deleted; subscribing reopens it (Stripe webhook).

const DAY_MS = 24 * 60 * 60 * 1000

async function clerkEmail(userId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    })
    if (!res.ok) return null
    const u = await res.json()
    return u.email_addresses?.find((e: { id: string }) => e.id === u.primary_email_address_id)?.email_address ?? null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()
  const now = Date.now()

  const { data: rows, error } = await db
    .from('profiles')
    .select('id, user_id, name, push_token, free_expires_at, free_reminders_sent')
    .eq('plan', 'free')
    .eq('free_legacy', false)
    .is('account_closed_at', null)
    .not('free_expires_at', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let closed = 0
  let reminded = 0

  for (const p of (rows ?? []) as Array<Record<string, any>>) {
    const daysLeft = Math.ceil((new Date(p.free_expires_at).getTime() - now) / DAY_MS)

    // Past expiry → close the account (soft; data retained).
    if (daysLeft <= 0) {
      await db.from('profiles').update({ account_closed_at: new Date().toISOString() }).eq('id', p.id)
      if (p.push_token) {
        await sendPushNotification({
          to: p.push_token,
          title: 'Your free month has ended',
          body: 'Your profile is now offline. Subscribe to bring it back — your data is safe.',
          data: { screen: 'settings' },
        }).catch(() => {})
      }
      closed++
      continue
    }

    // Reminder windows — send each of 10/5/1 days once.
    const sent: number[] = p.free_reminders_sent ?? []
    if ((FREE_REMINDER_DAYS as readonly number[]).includes(daysLeft) && !sent.includes(daysLeft)) {
      const email = await clerkEmail(p.user_id)
      if (email) await sendFreeExpiryReminderEmail({ to: email, name: p.name ?? '', daysLeft }).catch(() => {})
      if (p.push_token) {
        await sendPushNotification({
          to: p.push_token,
          title: `Your free month ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
          body: 'Subscribe to keep your profile live and receive more vouches.',
          data: { screen: 'settings' },
        }).catch(() => {})
      }
      await db.from('profiles').update({ free_reminders_sent: [...sent, daysLeft] }).eq('id', p.id)
      reminded++
    }
  }

  console.log(`[cron/free-lifecycle] reminded ${reminded}, closed ${closed}`)
  return NextResponse.json({ ok: true, reminded, closed })
}
