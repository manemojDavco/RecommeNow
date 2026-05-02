/**
 * Creates 3 test accounts in Clerk (dev) + seeds profiles + vouches in Supabase.
 * Run once: node scripts/seed-test-users.mjs
 */

import { createClient } from '@supabase/supabase-js'

const CLERK_SECRET  = process.env.CLERK_SECRET_KEY
const SUPA_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPA_SERVICE  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!CLERK_SECRET || !SUPA_URL || !SUPA_SERVICE) {
  console.error('Missing required env vars: CLERK_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const db = createClient(SUPA_URL, SUPA_SERVICE)

// ─── helpers ───────────────────────────────────────────────────────────────

async function createClerkUser(email, password, firstName, lastName) {
  const res = await fetch('https://api.clerk.com/v1/users', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CLERK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: [email],
      password,
      first_name: firstName,
      last_name: lastName,
      skip_password_checks: true,
      skip_password_requirement: true,
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    // If already exists, look it up
    if (data.errors?.[0]?.code === 'form_identifier_exists') {
      console.log(`  ↩  ${email} already exists in Clerk, fetching…`)
      const list = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${CLERK_SECRET}` },
      }).then(r => r.json())
      return list[0]
    }
    throw new Error(`Clerk error for ${email}: ${JSON.stringify(data.errors ?? data)}`)
  }
  return data
}

function randomVoucher(i) {
  const names = ['Sarah Chen','James Okafor','Priya Sharma','Tom Richards','Anna Kowalski',
    'Luis Fernandez','Mei Zhang','David Osei','Fatima Al-Hassan','Luca Martini',
    'Emma Thompson','Carlos Rivera','Yuki Tanaka','Sophie Dubois','Ahmed Hassan',
    'Grace Nduka','Marco Bianchi','Natalia Volkov','Kevin O\'Brien','Diana Park']
  const titles = ['VP Engineering','Senior Designer','Head of Growth','CTO','Product Manager',
    'Engineering Manager','Director of Sales','Lead Developer','COO','UX Lead',
    'Chief of Staff','Senior Marketer','Head of People','Finance Director','Operations Lead']
  const companies = ['FinFlow','Healthara','NovaTech','Orbit Labs','Stackwise',
    'PulseAI','Meridian','ClearPath','Zenova','Riviera']
  const rels = ['Former manager','Former colleague','Direct report','Client','Mentor']
  const traits = [
    ['Strategic thinker','Cross-functional leadership','Data-driven'],
    ['Clear communicator','Technical depth','Collaborative'],
    ['Growth mindset','User empathy','Execution'],
    ['Problem solver','Fast learner','Team player'],
    ['Reliable','Detail oriented','Creative'],
  ]
  const quotes = [
    'One of the most capable professionals I\'ve worked with. Consistently delivers above expectations and brings the whole team along.',
    'Exceptional ability to translate complex problems into elegant solutions. Would hire again without hesitation.',
    'A rare combination of strategic thinking and execution. The best colleague I\'ve had in 10 years.',
    'Truly impressive work ethic and collaborative spirit. Everyone on the team respected their input.',
    'Outstanding communicator and leader. Made our team significantly more effective during a critical period.',
    'Delivers quality work under pressure and always puts the team first. An asset to any organisation.',
    'Brought genuine expertise and fresh thinking to every challenge. Highly recommended.',
    'Their technical skills combined with business acumen is rare and extremely valuable.',
    'Proactive, dependable and sharp. I always knew things would get done properly.',
    'Excellent instincts, great listener and a natural mentor to junior team members.',
  ]

  const n = names[i % names.length]
  return {
    giver_name:         n,
    giver_title:        titles[i % titles.length],
    giver_company:      companies[i % companies.length],
    giver_email:        `${n.toLowerCase().replace(/[^a-z]/g,'')}${i}@example.com`,
    giver_relationship: rels[i % rels.length],
    traits:             traits[i % traits.length],
    quote:              quotes[i % quotes.length],
    star_rating:        [4,5,5,5,4,5,4,5,5,4][i % 10],
    verified:           true,
    flag_count:         0,
  }
}

async function seedProfile(clerkId, opts) {
  const { name, slug, title, bio, plan, recruiter, industries, stages } = opts

  // Upsert profile
  const { data: profile, error } = await db
    .from('profiles')
    .upsert({
      user_id: clerkId,
      name,
      slug,
      title,
      years_experience: '8',
      location: 'London, UK',
      remote_preference: 'Hybrid',
      availability: 'Immediately',
      bio,
      industries,
      stages,
      plan,
      recruiter_active: recruiter,
      referral_code: slug.slice(0,8),
      referral_count: 0,
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) throw new Error(`Profile upsert failed for ${slug}: ${error.message}`)

  const profileId = profile.id

  // Delete existing test vouches so re-runs are clean
  await db.from('vouches').delete().eq('profile_id', profileId)

  // Insert approved vouches
  const approvedVouches = Array.from({ length: opts.approvedCount }, (_, i) => ({
    profile_id: profileId,
    ...randomVoucher(i),
    status: 'approved',
  }))

  // Insert pending vouches
  const pendingVouches = Array.from({ length: opts.pendingCount }, (_, i) => ({
    profile_id: profileId,
    ...randomVoucher(opts.approvedCount + i),
    status: 'pending',
    verified: false,
  }))

  const { error: vErr } = await db
    .from('vouches')
    .insert([...approvedVouches, ...pendingVouches])

  if (vErr) throw new Error(`Vouches insert failed for ${slug}: ${vErr.message}`)

  return profile
}

// ─── ACCOUNTS ──────────────────────────────────────────────────────────────

const accounts = [
  {
    email:     'nick+testuser@omnispoc.com',
    password:  'T3$tu53R1',
    firstName: 'Test',
    lastName:  'User',
    profile: {
      name:         'Test User',
      slug:         'test-user-dev',
      title:        'Product Manager',
      bio:          'Test account for RecommeNow development. Free plan with 5 approved vouches.',
      plan:         'free',
      recruiter:    false,
      industries:   ['SaaS & Software', 'Fintech'],
      stages:       ['Start-up', 'Scale-up'],
      approvedCount: 5,
      pendingCount:  5,
    },
  },
  {
    email:     'nick+testpaid@omnispoc.com',
    password:  'T3$tu53R2',
    firstName: 'Test',
    lastName:  'Paid',
    profile: {
      name:         'Test Paid User',
      slug:         'test-paid-dev',
      title:        'Head of Engineering',
      bio:          'Test account for RecommeNow development. Pro plan with 14 approved vouches.',
      plan:         'pro',
      recruiter:    false,
      industries:   ['Information Technology', 'Cloud Computing', 'Data & Analytics'],
      stages:       ['Scale-up', 'Enterprise', 'Public Company'],
      approvedCount: 14,
      pendingCount:  10,
    },
  },
  {
    email:     'nick+testrecruiter@omnispoc.com',
    password:  'T3$tu53Rr3',
    firstName: 'Test',
    lastName:  'Recruiter',
    profile: {
      name:         'Test Recruiter',
      slug:         'test-recruiter-dev',
      title:        'Talent Acquisition Lead',
      bio:          'Test recruiter account for RecommeNow development. Recruiter plan active.',
      plan:         'free',
      recruiter:    true,
      industries:   ['HR & Recruitment', 'Consulting'],
      stages:       ['Start-up', 'Scale-up', 'Enterprise'],
      approvedCount: 3,
      pendingCount:  2,
    },
  },
]

// ─── RUN ───────────────────────────────────────────────────────────────────

console.log('Creating test accounts…\n')

for (const acc of accounts) {
  try {
    process.stdout.write(`→ ${acc.email} … `)
    const clerkUser = await createClerkUser(acc.email, acc.password, acc.firstName, acc.lastName)
    process.stdout.write(`Clerk ✓ (${clerkUser.id})  `)
    const profile   = await seedProfile(clerkUser.id, acc.profile)
    console.log(`Profile ✓  slug: ${profile.slug}`)
  } catch (err) {
    console.error(`\n  ERROR: ${err.message}`)
  }
}

console.log('\nDone! Log in at http://localhost:3000/sign-in')
console.log('  nick+testuser@omnispoc.com      / T3$tu53R1')
console.log('  nick+testpaid@omnispoc.com      / T3$tu53R2')
console.log('  nick+testrecruiter@omnispoc.com / T3$tu53Rr3')
