export type Profile = {
  id: string
  user_id: string
  name: string
  slug: string
  title: string | null
  years_experience: string | null
  location: string | null
  remote_preference: string | null
  bio: string | null
  industries: string[]
  stages: string[]
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
