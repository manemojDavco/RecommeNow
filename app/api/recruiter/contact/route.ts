import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase-server'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()

  // Verify recruiter has active recruiter plan
  const { data: recruiterProfile } = await db
    .from('profiles')
    .select('id, name, recruiter_active')
    .eq('user_id', userId)
    .single()

  if (!recruiterProfile?.recruiter_active) {
    return NextResponse.json(
      { error: 'A Recruiter plan is required to contact candidates.' },
      { status: 403 }
    )
  }

  const { candidateSlug, company, message } = await req.json()
  if (!candidateSlug || !message?.trim()) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }
  if (message.trim().length < 20) {
    return NextResponse.json({ error: 'Message must be at least 20 characters.' }, { status: 400 })
  }

  // Look up candidate
  const { data: candidate } = await db
    .from('profiles')
    .select('id, name, user_id, slug')
    .eq('slug', candidateSlug)
    .single()

  if (!candidate) return NextResponse.json({ error: 'Candidate not found.' }, { status: 404 })

  // Get recruiter's email from Clerk
  let recruiterEmail: string | undefined
  try {
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    })
    if (clerkRes.ok) {
      const u = await clerkRes.json()
      recruiterEmail = u.email_addresses?.find((e: { id: string }) => e.id === u.primary_email_address_id)?.email_address
    }
  } catch { /* non-fatal */ }

  // Get candidate's email from Clerk
  let candidateEmail: string | undefined
  try {
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${candidate.user_id}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    })
    if (clerkRes.ok) {
      const u = await clerkRes.json()
      candidateEmail = u.email_addresses?.find((e: { id: string }) => e.id === u.primary_email_address_id)?.email_address
    }
  } catch { /* non-fatal */ }

  if (!candidateEmail) {
    return NextResponse.json({ error: 'Could not reach candidate.' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'
  const recruiterName = recruiterProfile.name
  const companyLabel = company?.trim() ? ` from ${company.trim()}` : ''

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8f7f3;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f3;padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e2dc">
        <tr><td style="background:#1a5c3a;padding:24px 36px">
          <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:20px;color:rgba(255,255,255,.9)">
            Recomme<span style="color:#fff">Now</span>
          </p>
        </td></tr>
        <tr><td style="padding:32px 36px">
          <h1 style="margin:0 0 6px;font-family:Georgia,serif;font-size:22px;color:#1c1917">
            A recruiter wants to connect
          </h1>
          <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6">
            <strong>${recruiterName}${companyLabel}</strong> saw your RecommeNow profile and sent you a message.
          </p>

          <div style="background:#f8f7f3;border-radius:8px;padding:20px 24px;margin-bottom:24px;border-left:3px solid #1a5c3a">
            <p style="margin:0;font-size:15px;color:#1c1917;line-height:1.7;white-space:pre-wrap">${message.trim()}</p>
          </div>

          ${recruiterEmail ? `
          <p style="margin:0 0 24px;font-size:14px;color:#6b7280">
            Reply directly to <a href="mailto:${recruiterEmail}" style="color:#1a5c3a;font-weight:600">${recruiterEmail}</a>
          </p>` : ''}

          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#1a5c3a;border-radius:8px;padding:12px 24px">
                <a href="${appUrl}/${candidate.slug}" style="color:#fff;font-size:14px;font-weight:700;text-decoration:none">
                  View your profile →
                </a>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:16px 36px;border-top:1px solid #e5e2dc">
          <p style="margin:0;font-size:12px;color:#9ca3af">
            Sent via RecommeNow · <a href="${appUrl}/trust" style="color:#1a5c3a">Trust policy</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'vouches@recommenow.com',
    to: candidateEmail,
    replyTo: recruiterEmail,
    subject: `${recruiterName}${companyLabel} wants to connect on RecommeNow`,
    html,
  })

  return NextResponse.json({ success: true })
}
