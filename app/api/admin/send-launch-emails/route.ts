import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase-server'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}

async function checkAdmin() {
  const { userId } = await auth()
  if (!userId) return false
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ''
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
  return adminEmails.includes(email.toLowerCase())
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = createServiceClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'

  // Fetch all waitlist emails
  const { data: waitlist, error: dbError } = await db
    .from('waitlist')
    .select('id, email')
    .order('created_at', { ascending: true })

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  if (!waitlist || waitlist.length === 0) return NextResponse.json({ sent: 0, message: 'Waitlist is empty' })

  const resend = getResend()
  let sent = 0
  const failed: string[] = []

  // Sign-up link that redirects to pricing with trial flag after sign-up
  const signUpUrl = `${appUrl}/sign-up?redirect_url=${encodeURIComponent(`${appUrl}/pricing?trial=1`)}`

  for (const entry of waitlist) {
    const html = buildLaunchEmail({ email: entry.email, signUpUrl, appUrl })

    const { error: sendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'hello@recommenow.com',
      to: entry.email,
      subject: "We're live — your free month of Pro is waiting",
      html,
    })

    if (sendError) {
      failed.push(entry.email)
    } else {
      sent++
    }

    // Small delay to avoid hitting rate limits
    await new Promise(r => setTimeout(r, 80))
  }

  return NextResponse.json({ sent, failed: failed.length, total: waitlist.length })
}

function buildLaunchEmail({ email, signUpUrl, appUrl }: { email: string; signUpUrl: string; appUrl: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>RecommeNow is live</title>
</head>
<body style="margin:0;padding:0;background:#f5f7f5;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7f5;padding:48px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8e2">

        <!-- Header -->
        <tr>
          <td style="background:#1b4332;padding:32px 40px 28px">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:12px;vertical-align:middle">
                  <img src="${appUrl}/logo.png" width="40" height="40" alt="RecommeNow" style="border-radius:8px;display:block" />
                </td>
                <td style="vertical-align:middle">
                  <span style="font-size:22px;font-weight:700;color:#f0ead6;letter-spacing:-0.02em">Recomme<span style="color:#52b788">Now</span></span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="padding:40px 40px 0">
            <div style="display:inline-block;background:#d8f3dc;border-radius:100px;padding:5px 14px;margin-bottom:20px">
              <span style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#1b4332">We are live</span>
            </div>
            <h1 style="margin:0 0 16px;font-size:28px;font-weight:800;color:#1b4332;line-height:1.2;letter-spacing:-0.02em">
              Your reputation is ready to work for you.
            </h1>
            <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.7">
              RecommeNow is officially live today. You signed up early — so we want to give you something back.
            </p>
            <p style="margin:0 0 32px;font-size:15px;color:#374151;line-height:1.7">
              <strong style="color:#1b4332">Your first month of Pro is on us.</strong> Unlimited vouches, custom profile slug, PDF one-pager, and priority support — free for 30 days, no charge until after your trial ends.
            </p>
          </td>
        </tr>

        <!-- What you get box -->
        <tr>
          <td style="padding:0 40px 32px">
            <div style="background:#f5f7f5;border-radius:12px;padding:24px 28px">
              <p style="margin:0 0 14px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#52705c">What's included in Pro</p>
              <table cellpadding="0" cellspacing="0" width="100%">
                ${[
                  'Unlimited vouches (Free plan caps at 10)',
                  'Custom slug — yourname.recommenow.com',
                  'Downloadable PDF one-pager',
                  'Embeddable profile widget',
                  'Priority support',
                ].map(f => `
                <tr>
                  <td width="22" style="vertical-align:top;padding-top:2px">
                    <span style="color:#1b4332;font-weight:700;font-size:14px">✓</span>
                  </td>
                  <td style="font-size:14px;color:#374151;padding-bottom:10px;line-height:1.5">${f}</td>
                </tr>`).join('')}
              </table>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 40px 16px" align="center">
            <a href="${signUpUrl}"
               style="display:inline-block;background:#1b4332;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px;letter-spacing:-0.01em">
              Claim your free month →
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 40px" align="center">
            <p style="margin:0;font-size:12px;color:#9ca3af">No credit card required to start. Cancel anytime.</p>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 40px">
            <div style="height:1px;background:#e5e7eb"></div>
          </td>
        </tr>

        <!-- How it works -->
        <tr>
          <td style="padding:32px 40px">
            <p style="margin:0 0 18px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#52705c">How it works</p>
            <table cellpadding="0" cellspacing="0" width="100%">
              ${[
                ['1', 'Create your profile', 'Add your title, location, and bio in minutes.'],
                ['2', 'Request vouches', 'Share your unique link with former colleagues, managers, or clients.'],
                ['3', 'Share everywhere', 'Add your RecommeNow link to your CV, LinkedIn, and job applications.'],
              ].map(([n, title, desc]) => `
              <tr>
                <td width="36" style="vertical-align:top;padding-top:2px">
                  <div style="width:24px;height:24px;background:#d8f3dc;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#1b4332">${n}</div>
                </td>
                <td style="padding-bottom:16px">
                  <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#1b4332">${title}</p>
                  <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5">${desc}</p>
                </td>
              </tr>`).join('')}
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f7f5;padding:24px 40px;border-top:1px solid #e5e7eb">
            <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;line-height:1.6">
              You're receiving this because you joined the RecommeNow waitlist with this address (${email}).
            </p>
            <p style="margin:0;font-size:12px;color:#9ca3af">
              <a href="${appUrl}" style="color:#52705c;text-decoration:none">recommenow.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
