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
