/**
 * LAUNCH BLAST — sends the launch email to every address on the waitlist.
 *
 *   node scripts/send-launch-emails.mjs
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
try {
  readFileSync(resolve(__dirname, '../.env.local'), 'utf8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=')
    if (key && rest.length && !key.startsWith('#')) process.env[key.trim()] = rest.join('=').trim()
  })
} catch { /* use existing env */ }

const SUPABASE_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY
const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM           = 'hello@recommenow.com'
const APP_URL        = 'https://recommenow.com'

if (!SUPABASE_URL || !SUPABASE_KEY || !RESEND_API_KEY) {
  console.error('Missing env vars. Check SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY')
  process.exit(1)
}

async function getWaitlist() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/waitlist?select=id,email&order=created_at.asc`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  )
  if (!res.ok) throw new Error(`Supabase error: ${await res.text()}`)
  return res.json()
}

async function sendEmail(to) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to,
      subject: "We're live. Your free month of Pro is waiting",
      html: buildEmail(to),
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? JSON.stringify(data))
  return data
}

async function main() {
  console.log('Fetching waitlist...')
  const waitlist = await getWaitlist()
  console.log(`Found ${waitlist.length} emails\n`)

  let sent = 0, failed = 0

  for (const entry of waitlist) {
    try {
      await sendEmail(entry.email)
      console.log(`✓  ${entry.email}`)
      sent++
    } catch (err) {
      console.error(`✗  ${entry.email}  —  ${err.message}`)
      failed++
    }
    await new Promise(r => setTimeout(r, 80))
  }

  console.log(`\n──────────────────────────────`)
  console.log(`Sent:   ${sent}`)
  console.log(`Failed: ${failed}`)
  console.log(`Total:  ${waitlist.length}`)
}

main().catch(err => { console.error(err); process.exit(1) })

// ── Email template ────────────────────────────────────────────────────────────
function buildEmail(email) {
  const signUpUrl  = `${APP_URL}/sign-up?redirect_url=${encodeURIComponent(`${APP_URL}/pricing?trial=1`)}`
  const LOGO       = `${APP_URL}/brand/logo-mark-on-dark.svg`
  const LOGO_WHITE = `${APP_URL}/brand/logo-mark-on-white.svg`

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f7f5;font-family:'Helvetica Neue',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7f5;padding:48px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8e2">

        <!-- Header -->
        <tr><td style="background:#1b4332;padding:28px 40px">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:10px;vertical-align:middle">
              <img src="${LOGO}" width="36" height="36" alt="RecommeNow" style="display:block;border-radius:8px" />
            </td>
            <td style="vertical-align:middle">
              <span style="font-size:22px;font-weight:700;color:#f0ead6;letter-spacing:-0.02em">Recomme<span style="color:#52b788">Now</span></span>
            </td>
          </tr></table>
        </td></tr>

        <!-- Hero -->
        <tr><td style="padding:40px 40px 0">
          <div style="display:inline-block;background:#d8f3dc;border-radius:100px;padding:5px 14px;margin-bottom:20px">
            <span style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#1b4332">We are live</span>
          </div>
          <h1 style="margin:0 0 16px;font-size:28px;font-weight:800;color:#1b4332;line-height:1.2">Your reputation is ready to work for you.</h1>
          <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.7">RecommeNow is officially live today. You signed up early so we want to give you something back.</p>
          <p style="margin:0 0 32px;font-size:15px;color:#374151;line-height:1.7"><strong style="color:#1b4332">Your first month of Pro is on us.</strong> Unlimited vouches, custom profile slug, PDF one-pager, and priority support. Free for 30 days, no charge until after your trial ends.</p>
        </td></tr>

        <!-- What you get -->
        <tr><td style="padding:0 40px 32px">
          <div style="background:#f5f7f5;border-radius:12px;padding:24px 28px">
            <p style="margin:0 0 14px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#52705c">What is included in Pro</p>
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr><td width="22" style="vertical-align:top;padding-top:2px"><span style="color:#1b4332;font-weight:700;font-size:14px">✓</span></td><td style="font-size:14px;color:#374151;padding-bottom:10px;line-height:1.5">Unlimited vouches (Free plan caps at 10)</td></tr>
              <tr><td width="22" style="vertical-align:top;padding-top:2px"><span style="color:#1b4332;font-weight:700;font-size:14px">✓</span></td><td style="font-size:14px;color:#374151;padding-bottom:10px;line-height:1.5">Custom slug: yourname.recommenow.com</td></tr>
              <tr><td width="22" style="vertical-align:top;padding-top:2px"><span style="color:#1b4332;font-weight:700;font-size:14px">✓</span></td><td style="font-size:14px;color:#374151;padding-bottom:10px;line-height:1.5">Downloadable PDF one-pager</td></tr>
              <tr><td width="22" style="vertical-align:top;padding-top:2px"><span style="color:#1b4332;font-weight:700;font-size:14px">✓</span></td><td style="font-size:14px;color:#374151;padding-bottom:10px;line-height:1.5">Embeddable profile widget</td></tr>
              <tr><td width="22" style="vertical-align:top;padding-top:2px"><span style="color:#1b4332;font-weight:700;font-size:14px">✓</span></td><td style="font-size:14px;color:#374151;padding-bottom:10px;line-height:1.5">Priority support</td></tr>
            </table>
          </div>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:0 40px 12px" align="center">
          <a href="${signUpUrl}" style="display:inline-block;background:#1b4332;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:10px">Claim your free month</a>
        </td></tr>
        <tr><td style="padding:0 40px 40px" align="center">
          <p style="margin:0;font-size:12px;color:#9ca3af">No credit card required to start. Cancel anytime.</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f5f7f5;padding:24px 40px;border-top:1px solid #e5e7eb">
          <table cellpadding="0" cellspacing="0" style="margin-bottom:10px"><tr>
            <td style="padding-right:8px;vertical-align:middle">
              <img src="${LOGO_WHITE}" width="24" height="24" alt="RecommeNow" style="display:block;border-radius:5px" />
            </td>
            <td style="vertical-align:middle">
              <span style="font-size:14px;font-weight:700;color:#374151;letter-spacing:-0.01em">Recomme<span style="color:#52b788">Now</span></span>
            </td>
          </tr></table>
          <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6">
            You are receiving this because you joined the RecommeNow waitlist (${email}).<br>
            <a href="${APP_URL}" style="color:#52705c;text-decoration:none">recommenow.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`
}
