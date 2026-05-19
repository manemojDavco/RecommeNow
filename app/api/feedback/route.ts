import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder')

export async function POST(req: NextRequest) {
  const { email, message } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }
  if (!message || message.trim().length < 5) {
    return NextResponse.json({ error: 'Message too short' }, { status: 400 })
  }

  const { error } = await resend.emails.send({
    from: 'feedback@recommenow.com',
    to: 'social@recommenow.com',
    replyTo: email,
    subject: `Feedback from ${email}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#141210">
        <p style="font-size:13px;color:#6e6a64;margin:0 0 24px">RecommeNow · Landing page feedback</p>
        <p style="font-size:15px;font-weight:600;margin:0 0 4px">From</p>
        <p style="font-size:15px;color:#6e6a64;margin:0 0 24px">${email}</p>
        <p style="font-size:15px;font-weight:600;margin:0 0 8px">Message</p>
        <p style="font-size:15px;line-height:1.7;color:#333;white-space:pre-wrap;margin:0">${message.trim()}</p>
      </div>
    `,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
