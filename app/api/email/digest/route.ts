import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase-server'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}

// Called by a weekly cron (Vercel Cron, Upstash QStash, etc.)
// Protect with Authorization: Bearer <CRON_SECRET>
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceClient()
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Get all profiles that have new vouches in the last 7 days
  const { data: recentVouches } = await db
    .from('vouches')
    .select('profile_id, giver_name, giver_title, giver_company, star_rating, status, created_at')
    .gte('created_at', since)

  if (!recentVouches || recentVouches.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No new activity this week' })
  }

  // Group by profile_id
  const byProfile = recentVouches.reduce<Record<string, typeof recentVouches>>((acc, v) => {
    acc[v.profile_id] = acc[v.profile_id] ?? []
    acc[v.profile_id].push(v)
    return acc
  }, {})

  const profileIds = Object.keys(byProfile)
  const { data: profiles } = await db
    .from('profiles')
    .select('id, user_id, name, slug')
    .in('id', profileIds)

  if (!profiles) return NextResponse.json({ sent: 0 })

  let sent = 0
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'

  for (const profile of profiles) {
    const vouches = byProfile[profile.id] ?? []
    const newCount = vouches.length
    const pending = vouches.filter((v) => v.status === 'pending').length

    // Fetch candidate email from Clerk
    let candidateEmail: string | undefined
    try {
      const clerkRes = await fetch(`https://api.clerk.com/v1/users/${profile.user_id}`, {
        headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
      })
      if (clerkRes.ok) {
        const u = await clerkRes.json()
        candidateEmail = u.email_addresses?.find((e: { id: string }) => e.id === u.primary_email_address_id)?.email_address
      }
    } catch { /* skip */ }

    if (!candidateEmail) continue

    const html = buildDigestEmail({
      name: profile.name,
      slug: profile.slug,
      newCount,
      pending,
      vouches: vouches.slice(0, 3),
      appUrl,
    })

    await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'vouches@recommenow.com',
      to: candidateEmail,
      subject: `Your RecommeNow digest: ${newCount} new ${newCount === 1 ? 'vouch' : 'vouches'} this week`,
      html,
    }).catch(console.error)

    sent++
  }

  return NextResponse.json({ sent })
}

function buildDigestEmail(opts: {
  name: string
  slug: string
  newCount: number
  pending: number
  vouches: Array<{ giver_name: string; giver_title: string | null; giver_company: string | null; star_rating: number }>
  appUrl: string
}) {
  const { name, slug, newCount, pending, vouches, appUrl } = opts
  const firstName = name.split(' ')[0]
  const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f7f3;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f3;padding:40px 0">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e2dc">
        <!-- Header -->
        <tr><td style="background:#1a5c3a;padding:28px 40px">
          <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:22px;color:rgba(255,255,255,.9)">
            Recomme<span style="color:#fff">Now</span>
          </p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px">
          <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;color:#1c1917">
            Hey ${firstName}, your weekly digest is here
          </h1>
          <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6">
            You received <strong>${newCount} new ${newCount === 1 ? 'vouch' : 'vouches'}</strong> this week.
            ${pending > 0 ? `<strong>${pending}</strong> ${pending === 1 ? 'is' : 'are'} waiting for your approval.` : ''}
          </p>

          ${vouches.map((v) => `
          <div style="background:#f8f7f3;border-radius:8px;padding:16px 20px;margin-bottom:12px">
            <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1c1917">${v.giver_name}${v.giver_company ? ` · ${v.giver_company}` : ''}</p>
            ${v.giver_title ? `<p style="margin:0 0 6px;font-size:13px;color:#6b7280">${v.giver_title}</p>` : ''}
            <p style="margin:0;color:#1a5c3a;font-size:16px;letter-spacing:.05em">${stars(v.star_rating)}</p>
          </div>`).join('')}

          <table cellpadding="0" cellspacing="0" style="margin-top:28px">
            <tr>
              <td style="background:#1a5c3a;border-radius:8px;padding:14px 28px">
                <a href="${appUrl}/dashboard/approvals" style="color:#fff;font-size:14px;font-weight:700;text-decoration:none">
                  Review vouches →
                </a>
              </td>
              <td style="width:12px"></td>
              <td style="border:1.5px solid #e5e2dc;border-radius:8px;padding:14px 28px">
                <a href="${appUrl}/${slug}" style="color:#1c1917;font-size:14px;font-weight:600;text-decoration:none">
                  View your profile
                </a>
              </td>
            </tr>
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid #e5e2dc">
          <p style="margin:0;font-size:12px;color:#9ca3af">
            You're receiving this because you have an account on RecommeNow.
            <a href="${appUrl}/dashboard/settings" style="color:#1a5c3a">Manage preferences</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
