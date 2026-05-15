import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase-server'

const MAX_EMAILS_PER_REQUEST = 10

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { emails } = await req.json() as { emails: string[] }

  if (!Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json({ error: 'No emails provided' }, { status: 400 })
  }
  if (emails.length > MAX_EMAILS_PER_REQUEST) {
    return NextResponse.json({ error: `Max ${MAX_EMAILS_PER_REQUEST} emails per send` }, { status: 400 })
  }

  const db = createServiceClient()
  const { data: profile } = await db
    .from('profiles')
    .select('name, slug')
    .eq('user_id', userId)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const user = await currentUser()
  const senderEmail = user?.emailAddresses?.[0]?.emailAddress ?? ''
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'
  const vouchUrl = `${appUrl}/vouch/${profile.slug}`
  const firstName = profile.name.split(' ')[0]

  const resend = getResend()
  let sent = 0
  const failed: string[] = []

  for (const email of emails) {
    const { error } = await resend.emails.send({
      from: `${profile.name} via RecommeNow <hello@recommenow.com>`,
      replyTo: senderEmail || undefined,
      to: email,
      subject: `${firstName} is asking for a vouch`,
      html: buildVouchRequestEmail({ name: profile.name, firstName, vouchUrl, appUrl }),
    })
    if (error) {
      failed.push(email)
    } else {
      sent++
    }
    await new Promise(r => setTimeout(r, 60))
  }

  return NextResponse.json({ sent, failed, total: emails.length })
}

function buildVouchRequestEmail({ name, firstName, vouchUrl, appUrl }: {
  name: string; firstName: string; vouchUrl: string; appUrl: string
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${firstName} is asking for a vouch</title>
</head>
<body style="margin:0;padding:0;background:#f5f7f5;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7f5;padding:48px 16px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8e2">

        <!-- Header -->
        <tr>
          <td style="background:#1b4332;padding:28px 36px 24px">
            <span style="font-size:20px;font-weight:700;color:#f0ead6;letter-spacing:-0.02em">Recomme<span style="color:#52b788">Now</span></span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 36px 0">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#1b4332;line-height:1.25;letter-spacing:-0.02em">
              ${name} is asking for a vouch
            </h1>
            <p style="margin:0 0 14px;font-size:15px;color:#374151;line-height:1.7">
              Hi there,
            </p>
            <p style="margin:0 0 14px;font-size:15px;color:#374151;line-height:1.7">
              <strong style="color:#1b4332">${name}</strong> has built a verified professional profile on RecommeNow and is asking if you'd be willing to share a few words about working together.
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7">
              It takes about 2 minutes. Just click the button below, fill in a short vouch, and ${firstName}'s profile will be updated automatically once verified.
            </p>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 36px 28px" align="center">
            <a href="${vouchUrl}"
               style="display:inline-block;background:#1b4332;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:15px 36px;border-radius:10px;letter-spacing:-0.01em">
              Vouch for ${firstName} →
            </a>
          </td>
        </tr>

        <!-- What happens box -->
        <tr>
          <td style="padding:0 36px 32px">
            <div style="background:#f5f7f5;border-radius:10px;padding:20px 24px">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#52705c">What happens when you vouch</p>
              <table cellpadding="0" cellspacing="0" width="100%">
                ${[
                  'Takes ~2 minutes to complete',
                  'You\'ll be asked to verify your email once',
                  'Your vouch appears on their public profile',
                ].map(f => `
                <tr>
                  <td width="20" style="vertical-align:top;padding-top:2px">
                    <span style="color:#1b4332;font-weight:700;font-size:13px">✓</span>
                  </td>
                  <td style="font-size:13px;color:#374151;padding-bottom:8px;line-height:1.5">${f}</td>
                </tr>`).join('')}
              </table>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f7f5;padding:20px 36px;border-top:1px solid #e5e7eb">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6">
              You received this because <strong style="color:#52705c">${name}</strong> personally sent you a vouch request. If you don't want to vouch, simply ignore this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
