// Calculates a credibility score (1.0–5.0) from objective vouch factors.
// The voucher never sets this number directly — it's derived from context.

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.com.au',
  'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'live.com', 'icloud.com',
  'me.com', 'mac.com', 'aol.com', 'protonmail.com', 'proton.me',
  'mail.com', 'ymail.com', 'msn.com',
])

const RELATIONSHIP_BASE: Record<string, number> = {
  'Direct manager':    3.5,
  'Skip-level manager':3.3,
  'Client':            3.3,
  'Direct report':     2.9,
  'Peer / colleague':  3.0,
  'Ex-colleague':      2.8,
  'Investor':          3.0,
  'Vendor / partner':  2.7,
  'Friend':            2.2,
  'Other':             2.5,
}

export type ScoreFactors = {
  relationship: string | null
  quoteLength: number
  traitCount: number
  email: string
  verified: boolean
}

export type ScoreBreakdown = {
  score: number
  base: number
  quoteBonus: number
  traitsBonus: number
  emailBonus: number
  verifiedBonus: number
  isWorkEmail: boolean
}

export function calculateVouchScore(f: ScoreFactors): ScoreBreakdown {
  // 1. Relationship base
  const base = RELATIONSHIP_BASE[f.relationship ?? ''] ?? 2.5

  // 2. Quote depth
  const quoteBonus =
    f.quoteLength >= 250 ? 0.7 :
    f.quoteLength >= 150 ? 0.5 :
    f.quoteLength >= 80  ? 0.3 : 0.1

  // 3. Traits
  const traitsBonus =
    f.traitCount >= 4 ? 0.4 :
    f.traitCount >= 2 ? 0.2 :
    f.traitCount === 1 ? 0.1 : 0

  // 4. Email type
  const domain = f.email.split('@')[1]?.toLowerCase() ?? ''
  const isWorkEmail = !!domain && !FREE_EMAIL_DOMAINS.has(domain)
  const emailBonus = isWorkEmail ? 0.2 : 0

  // 5. Verification bonus (added when giver clicks email link)
  const verifiedBonus = f.verified ? 0.3 : 0

  const raw = base + quoteBonus + traitsBonus + emailBonus + verifiedBonus
  const score = Math.min(5.0, Math.max(1.0, Math.round(raw * 10) / 10))

  return { score, base, quoteBonus, traitsBonus, emailBonus, verifiedBonus, isWorkEmail }
}

export const SCORE_EXPLANATION = [
  { label: 'Relationship type',  desc: 'Managers and clients carry more weight than friends or unspecified contacts.' },
  { label: 'Vouch detail',       desc: 'Longer, more specific vouches score higher than brief ones.' },
  { label: 'Traits selected',    desc: 'Choosing relevant traits adds professional context.' },
  { label: 'Professional email', desc: 'A work email address is weighted higher than a free provider (Gmail, Yahoo, etc.).' },
  { label: 'Email verified',     desc: 'A verified email proves the giver is real and adds a credibility bonus.' },
]
