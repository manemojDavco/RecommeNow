import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase-server'

const INDUSTRIES = [
  'Accounting & Tax', 'Advertising & Marketing', 'Aerospace & Defence', 'Agriculture & Farming',
  'Architecture & Design', 'Automotive', 'Aviation', 'Banking & Finance', 'Biotechnology',
  'Broadcasting & Media', 'Chemicals & Materials', 'Clean Energy & Renewables', 'Cloud Computing',
  'Computer Hardware', 'Construction & Real Estate', 'Consulting', 'Consumer Goods', 'Cybersecurity',
  'Data & Analytics', 'E-commerce', 'EdTech', 'Electronics & Semiconductors', 'Environmental Services',
  'Events & Entertainment', 'Fashion & Apparel', 'Film & TV Production', 'Fintech', 'Food & Beverage',
  'Gaming & Esports', 'Government & Public Sector', 'Healthcare & Medical', 'HR & Recruitment',
  'Hospitality & Tourism', 'Industrial Manufacturing', 'Information Technology', 'Insurance',
  'Journalism & Publishing', 'Legal Services', 'Logistics & Supply Chain', 'Luxury Goods',
  'Manufacturing', 'Market Research', 'Medical Devices', 'Mining & Resources', 'Mobile & Apps',
  'Music & Audio', 'Non-profit & NGO', 'Oil & Gas', 'Pharmaceuticals', 'Private Equity & VC',
  'PropTech', 'Public Relations', 'Retail', 'SaaS & Software', 'Security Services',
  'Social Impact', 'Sports & Fitness', 'Telecommunications', 'Transportation', 'Travel & Tourism',
  'Utilities & Infrastructure', 'Web3 & Blockchain', 'Wellness & Health',
]

type AIFilters = {
  keywords: string
  industries: string[]
  location: string
  remote_preference: string
  sort: string
}

async function parseQueryWithAI(query: string): Promise<AIFilters> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `You are a search filter parser for a professional talent directory. Extract structured search filters from this natural language query.

Available industries: ${INDUSTRIES.join(', ')}
Available remote preferences: "Remote only", "Hybrid", "On-site", "Open to all"
Sort options: "vouches" (most vouches), "trust" (highest trust score)

Query: "${query}"

Respond with ONLY valid JSON, no explanation:
{
  "keywords": "<key skills/role/title terms to search in name and title fields, 1-4 words>",
  "industries": ["<matched industries from the list above only — empty array if none clearly match>"],
  "location": "<city or country if mentioned, else empty string>",
  "remote_preference": "<exact match from the list above or empty string>",
  "sort": "vouches"
}`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  try {
    const parsed = JSON.parse(text.trim())
    // Validate industries against our list
    const validIndustries = (parsed.industries ?? []).filter((i: string) => INDUSTRIES.includes(i))
    return {
      keywords: parsed.keywords ?? '',
      industries: validIndustries,
      location: parsed.location ?? '',
      remote_preference: parsed.remote_preference ?? '',
      sort: parsed.sort ?? 'vouches',
    }
  } catch {
    return { keywords: query, industries: [], location: '', remote_preference: '', sort: 'vouches' }
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const query: string = (body.query ?? '').trim()
  if (!query) return NextResponse.json({ profiles: [], filters: {} })

  const filters = await parseQueryWithAI(query)

  const db = createServiceClient()
  let dbQuery = db.from('public_directory').select('*').limit(24)

  if (filters.keywords) {
    dbQuery = dbQuery.or(`name.ilike.%${filters.keywords}%,title.ilike.%${filters.keywords}%`)
  }
  if (filters.industries.length > 0) {
    // Match any of the extracted industries
    dbQuery = dbQuery.overlaps('industries', filters.industries)
  }
  if (filters.location) {
    dbQuery = dbQuery.ilike('location', `%${filters.location}%`)
  }
  if (filters.remote_preference) {
    dbQuery = dbQuery.eq('remote_preference', filters.remote_preference)
  }

  if (filters.sort === 'trust') {
    dbQuery = dbQuery.order('trust_score', { ascending: false })
  } else {
    dbQuery = dbQuery.order('vouch_count', { ascending: false })
  }

  const { data, error } = await dbQuery
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ profiles: data ?? [], filters })
}
