import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM_EMAIL ?? 'vouches@recommenow.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://recommenow.com'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}

// ── Reusable branded email header ─────────────────────────────────────────────
const EMAIL_LOGO = `
<table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 36px">
  <tr>
    <td style="padding-right:10px;vertical-align:middle;">
      <img src="https://recommenow.com/favicon-180.png" width="32" height="32"
           style="display:block;border-radius:7px;" alt="RecommeNow" />
    </td>
    <td style="vertical-align:middle;line-height:1;">
      <span style="font-size:18px;font-weight:800;color:#1c3d2c;font-family:-apple-system,Helvetica,Arial,sans-serif;letter-spacing:-0.4px;">Recomme</span><span style="font-size:18px;font-weight:800;color:#2D6A4F;font-family:-apple-system,Helvetica,Arial,sans-serif;letter-spacing:-0.4px;">Now</span>
    </td>
  </tr>
</table>`

export async function sendVouchVerificationEmail({
  to,
  giverName,
  candidateName,
  token,
}: {
  to: string
  giverName: string
  candidateName: string
  token: string
}) {
  const link = `${APP_URL}/api/vouches/verify?token=${token}`
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Please verify your vouch for ${candidateName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#141210">
        ${EMAIL_LOGO}
        <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:400;margin:0 0 16px;letter-spacing:-0.02em">
          Thanks for vouching for ${candidateName}
        </h1>
        <p style="font-size:15px;line-height:1.7;color:#6e6a64;margin:0 0 24px">
          Hi ${giverName}, please verify your work email to make your vouch count toward ${candidateName}'s verified score.
        </p>
        <a href="${link}" style="display:inline-block;background:#1c3d2c;color:#fff;text-decoration:none;padding:12px 24px;border-radius:7px;font-size:14px;font-weight:600">
          Verify my vouch →
        </a>
        <p style="font-size:12px;color:#6e6a64;margin:32px 0 0;line-height:1.6">
          If you didn't submit a vouch on RecommeNow, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}

export async function sendFreeExpiryReminderEmail({
  to,
  name,
  daysLeft,
}: {
  to: string
  name: string
  daysLeft: number
}) {
  const dayLabel = daysLeft === 1 ? '1 day' : `${daysLeft} days`
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Your RecommeNow free month ends in ${dayLabel}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#141210">
        ${EMAIL_LOGO}
        <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:400;margin:0 0 16px;letter-spacing:-0.02em">
          ${name ? `Hi ${name}, your` : 'Your'} free month ends in ${dayLabel}
        </h1>
        <p style="font-size:15px;line-height:1.7;color:#6e6a64;margin:0 0 24px">
          To keep your profile and vouch live — and to receive more vouches — start a subscription before your free month ends. If you don't subscribe, your profile is taken offline; your data is kept and restored the moment you subscribe.
        </p>
        <a href="${APP_URL}/pricing" style="display:inline-block;background:#1c3d2c;color:#fff;text-decoration:none;padding:12px 24px;border-radius:7px;font-size:14px;font-weight:600">
          Choose a plan →
        </a>
        <p style="font-size:12px;color:#6e6a64;margin:32px 0 0;line-height:1.6">
          Member keeps 1 vouch, Pro up to 5, Pro+ up to 10, and Recruiter adds the talent directory.
        </p>
      </div>
    `,
  })
}

export async function sendNewVouchNotification({
  to,
  candidateName,
  giverName,
  giverTitle,
  giverCompany,
  profileSlug,
}: {
  to: string
  candidateName: string
  giverName: string
  giverTitle: string | null
  giverCompany: string | null
  profileSlug: string
}) {
  const dashboardLink = `${APP_URL}/dashboard`
  const fromLine = [giverTitle, giverCompany].filter(Boolean).join(' at ')
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `You have a new vouch from ${giverName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#141210">
        ${EMAIL_LOGO}
        <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:400;margin:0 0 16px;letter-spacing:-0.02em">
          New vouch from ${giverName}
        </h1>
        <p style="font-size:15px;line-height:1.7;color:#6e6a64;margin:0 0 8px">
          <strong style="color:#141210">${giverName}</strong>${fromLine ? ` (${fromLine})` : ''} just submitted a vouch for you.
        </p>
        <p style="font-size:14px;line-height:1.6;color:#6e6a64;margin:0 0 24px">
          Review it in your dashboard and approve it to make it visible on your public profile.
        </p>
        <a href="${dashboardLink}" style="display:inline-block;background:#1c3d2c;color:#fff;text-decoration:none;padding:12px 24px;border-radius:7px;font-size:14px;font-weight:600">
          Review in dashboard →
        </a>
      </div>
    `,
  })
}

export async function sendVouchApprovedEmail({
  to,
  giverName,
  candidateName,
  profileSlug,
}: {
  to: string
  giverName: string
  candidateName: string
  profileSlug: string
}) {
  const profileLink = `${APP_URL}/${profileSlug}`
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Your vouch for ${candidateName} is now live`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#141210">
        ${EMAIL_LOGO}
        <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:400;margin:0 0 16px;letter-spacing:-0.02em">
          Your vouch is live
        </h1>
        <p style="font-size:15px;line-height:1.7;color:#6e6a64;margin:0 0 24px">
          Hi ${giverName}, ${candidateName} has approved your vouch. It's now visible on their public profile.
        </p>
        <a href="${profileLink}" style="display:inline-block;background:#1c3d2c;color:#fff;text-decoration:none;padding:12px 24px;border-radius:7px;font-size:14px;font-weight:600">
          See the profile →
        </a>
      </div>
    `,
  })
}

export async function sendConnectedEmailVerification({
  to,
  userName,
  token,
}: {
  to: string
  userName: string
  token: string
}) {
  const link = `${APP_URL}/api/settings/emails/verify?token=${token}`
  return getResend().emails.send({
    from: FROM,
    to,
    subject: 'Verify your email address on RecommeNow',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#141210">
        ${EMAIL_LOGO}
        <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:400;margin:0 0 16px;letter-spacing:-0.02em">
          Verify your email address
        </h1>
        <p style="font-size:15px;line-height:1.7;color:#6e6a64;margin:0 0 24px">
          Hi ${userName}, click below to verify <strong style="color:#141210">${to}</strong> and connect it to your RecommeNow account. Any vouches you've given from this address will appear in your Given section.
        </p>
        <a href="${link}" style="display:inline-block;background:#1c3d2c;color:#fff;text-decoration:none;padding:12px 24px;border-radius:7px;font-size:14px;font-weight:600">
          Verify email address →
        </a>
        <p style="font-size:12px;color:#6e6a64;margin:32px 0 0;line-height:1.6">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}

export async function sendFlagReviewEmail({
  to,
  giverName,
  candidateName,
}: {
  to: string
  giverName: string
  candidateName: string
}) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Your vouch has been flagged for review`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#141210">
        ${EMAIL_LOGO}
        <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:400;margin:0 0 16px;letter-spacing:-0.02em">
          Your vouch is under review
        </h1>
        <p style="font-size:15px;line-height:1.7;color:#6e6a64;margin:0 0 16px">
          Hi ${giverName}, your vouch for ${candidateName} has received multiple flags from the community and has been temporarily hidden for review.
        </p>
        <p style="font-size:14px;line-height:1.6;color:#6e6a64;margin:0 0 0">
          If you believe this is in error, please contact <a href="mailto:support@recommenow.com" style="color:#1c3d2c">support@recommenow.com</a>.
        </p>
      </div>
    `,
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// Partner program emails (Sprint 3)
// ═══════════════════════════════════════════════════════════════════════════

function partnerShell(inner: string): string {
  return `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#141210">${EMAIL_LOGO}${inner}</div>`
}
function partnerBtn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#1c3d2c;color:#fff;text-decoration:none;padding:12px 24px;border-radius:7px;font-size:14px;font-weight:600">${label}</a>`
}
const h1 = 'font-family:Georgia,serif;font-size:24px;font-weight:400;margin:0 0 16px;letter-spacing:-0.02em'
const p = 'font-size:15px;line-height:1.7;color:#6e6a64;margin:0 0 24px'

// 1 — Welcome (on approval): code, link, terms summary.
export async function sendPartnerWelcomeEmail({ to, name, code, dealLine }: {
  to: string; name: string; code: string; dealLine: string
}) {
  const link = `${APP_URL}/r/${code}`
  return getResend().emails.send({
    from: FROM, to, subject: 'Welcome to the RecommeNow partner program',
    html: partnerShell(`
      <h1 style="${h1}">Welcome aboard, ${name}</h1>
      <p style="${p}">Your partner account is live. Share your link below — anyone who signs up through it is attributed to you for 12 months.</p>
      <p style="font-size:15px;font-weight:700;color:#141210;margin:0 0 8px">Your link</p>
      <p style="font-size:16px;font-weight:700;color:#1c3d2c;margin:0 0 24px;word-break:break-all">${link}</p>
      <p style="${p}">${dealLine} Payouts are on cleared, non-refunded revenue, 30 days in arrears. Track everything anytime on your dashboard.</p>
      ${partnerBtn(`${APP_URL}/partner`, 'Open my dashboard →')}
    `),
  })
}

// 2 — First referred signup (real time, once).
export async function sendPartnerFirstSignupEmail({ to, name }: { to: string; name: string }) {
  return getResend().emails.send({
    from: FROM, to, subject: 'Your first RecommeNow referral just signed up 🎉',
    html: partnerShell(`
      <h1 style="${h1}">You're on the board, ${name}</h1>
      <p style="${p}">Your first referred user just created an account. You'll earn when they convert to a paid plan — we'll keep the running total on your dashboard.</p>
      ${partnerBtn(`${APP_URL}/partner`, 'See my dashboard →')}
    `),
  })
}

// 3 — Paid conversions digest (daily, never per-event).
export async function sendPartnerConversionsDigestEmail({ to, name, count }: {
  to: string; name: string; count: number
}) {
  return getResend().emails.send({
    from: FROM, to, subject: `${count} new paid conversion${count === 1 ? '' : 's'} on RecommeNow`,
    html: partnerShell(`
      <h1 style="${h1}">${count} new conversion${count === 1 ? '' : 's'} yesterday</h1>
      <p style="${p}">Nice work — ${count} referred user${count === 1 ? '' : 's'} started a paid plan. Commission is added to your next statement once it clears the 30-day window.</p>
      ${partnerBtn(`${APP_URL}/partner`, 'View my dashboard →')}
    `),
  })
}

// 4 — Monthly statement (1st of month) — the trust anchor.
export async function sendPartnerStatementEmail({ to, name, period, signups, conversions, clearedDisplay, dueDisplay, isRecruiter }: {
  to: string; name: string; period: string; signups: number; conversions: number
  clearedDisplay: string; dueDisplay: string; isRecruiter: boolean
}) {
  const row = (k: string, v: string) => `<tr><td style="padding:8px 0;color:#6e6a64;font-size:14px">${k}</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#141210;font-size:14px">${v}</td></tr>`
  return getResend().emails.send({
    from: FROM, to, subject: `Your RecommeNow statement — ${period}`,
    html: partnerShell(`
      <h1 style="${h1}">Statement for ${period}</h1>
      <p style="${p}">Hi ${name}, here's your summary for the month. Full detail and CSV export are on your dashboard.</p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px">
        ${row('Signups', String(signups))}
        ${row('Paid conversions', String(conversions))}
        ${row(isRecruiter ? 'Cleared net revenue' : 'Cleared conversions', clearedDisplay)}
        ${row(isRecruiter ? 'Share due' : 'Bounties due', dueDisplay)}
      </table>
      ${partnerBtn(`${APP_URL}/partner`, 'Open dashboard →')}
      <p style="font-size:12px;color:#6e6a64;margin:24px 0 0;line-height:1.6">Amounts due are on cleared, non-refunded revenue and are paid 30 days in arrears.</p>
    `),
  })
}

// 5 — Payout sent (on transfer).
export async function sendPartnerPayoutSentEmail({ to, name, amountDisplay, period }: {
  to: string; name: string; amountDisplay: string; period: string
}) {
  return getResend().emails.send({
    from: FROM, to, subject: `Your RecommeNow payout is on its way — ${amountDisplay}`,
    html: partnerShell(`
      <h1 style="${h1}">Payout sent: ${amountDisplay}</h1>
      <p style="${p}">Hi ${name}, your ${period} payout of ${amountDisplay} has been sent. Thank you for the reach you've built — it should reach your account shortly.</p>
      ${partnerBtn(`${APP_URL}/partner`, 'View statement →')}
    `),
  })
}

// 6 — Inactivity nudge (influencer/student, no signups 30 days).
export async function sendPartnerInactivityEmail({ to, name }: { to: string; name: string }) {
  return getResend().emails.send({
    from: FROM, to, subject: 'A few ideas to get your RecommeNow referrals moving',
    html: partnerShell(`
      <h1 style="${h1}">Let's get you some conversions, ${name}</h1>
      <p style="${p}">No new signups in the last month — totally normal early on. What tends to work: share your link in a post about job-hunting or references, add it to your bio, and mention it where people are actively applying for roles.</p>
      ${partnerBtn(`${APP_URL}/partner`, 'Grab my link →')}
    `),
  })
}

// 7 — Milestone (10th / 50th / 100th conversion).
export async function sendPartnerMilestoneEmail({ to, name, milestone }: {
  to: string; name: string; milestone: number
}) {
  return getResend().emails.send({
    from: FROM, to, subject: `🏆 ${milestone} paid conversions on RecommeNow`,
    html: partnerShell(`
      <h1 style="${h1}">${milestone} conversions — nice milestone, ${name}!</h1>
      <p style="${p}">You've now driven ${milestone} paid conversions. Thank you for the momentum. Keep sharing your link — every conversion counts toward your next statement.</p>
      ${partnerBtn(`${APP_URL}/partner`, 'See my dashboard →')}
    `),
  })
}
