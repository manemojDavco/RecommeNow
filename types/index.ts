export type Profile = {
  id: string
  user_id: string
  name: string
  slug: string
  title: string | null
  years_experience: string | null
  location: string | null
  remote_preference: string | null
  availability: string | null
  photo_url: string | null
  bio: string | null
  industries: string[]
  stages: string[]
  phone: string | null
  linkedin_url: string | null
  plan: 'free' | 'pro'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  referral_code: string | null
  referred_by: string | null
  referral_count: number
  recruiter_active: boolean
  recruiter_subscription_id: string | null
  created_at: string
  updated_at: string
}

export type Vouch = {
  id: string
  profile_id: string
  giver_name: string
  giver_title: string | null
  giver_company: string | null
  giver_email: string
  giver_relationship: string | null
  traits: string[]
  quote: string
  star_rating: number
  verified: boolean
  verification_token: string | null
  status: 'pending' | 'approved' | 'hidden' | 'flagged'
  flag_count: number
  display_order: number | null
  created_at: string
}

export type Flag = {
  id: string
  vouch_id: string
  reason: string
  reporter_email: string | null
  created_at: string
}

export type PublicProfile = Profile & {
  vouches: Vouch[]
  trust_score: number
  verification_rate: number
  vouch_count: number
}
