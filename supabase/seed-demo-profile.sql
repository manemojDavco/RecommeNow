-- Demo profile for the "See a sample profile" link on the home page
-- Run this once on your dev database

INSERT INTO profiles (
  id, user_id, name, slug, title, years_experience, location,
  remote_preference, availability, bio, industries, stages,
  plan, referral_code, referral_count, recruiter_active
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'demo_user_nick_baker',
  'Nick Baker',
  'nick-baker-demo',
  'Head of Product',
  '9',
  'London, UK',
  'Hybrid',
  'Immediately',
  'Product leader with 9 years of experience shipping B2B SaaS products from 0 to 1 and scaling them to enterprise. I''ve led cross-functional teams across fintech and healthtech, with a focus on data-driven growth and strong stakeholder alignment.',
  ARRAY['SaaS & Software', 'Fintech', 'Healthcare & Medical', 'Data & Analytics'],
  ARRAY['Start-up', 'Scale-up', 'Enterprise'],
  'pro',
  'demo0000',
  0,
  false
)
ON CONFLICT (slug) DO NOTHING;

-- Sample approved vouches for the demo profile
INSERT INTO vouches (
  id, profile_id, giver_name, giver_title, giver_company, giver_email,
  giver_relationship, traits, quote, star_rating, verified, status, flag_count
) VALUES
(
  'b1000000-0000-0000-0000-000000000001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Sarah Chen',
  'VP of Engineering',
  'FinFlow',
  'sarah.chen@example.com',
  'Former manager',
  ARRAY['Strategic thinker', 'Cross-functional leadership', 'Data-driven'],
  'Nick has an exceptional ability to translate complex user problems into elegant product solutions. In three years at FinFlow he shipped our core payments product and grew it to $4M ARR. I''d hire him again without hesitation.',
  5, true, 'approved', 0
),
(
  'b1000000-0000-0000-0000-000000000002',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'James Okafor',
  'Senior Engineer',
  'FinFlow',
  'james.okafor@example.com',
  'Former colleague',
  ARRAY['Collaborative', 'Clear communicator', 'Technical depth'],
  'Working with Nick was genuinely one of the highlights of my career at FinFlow. He writes the best PRDs I''ve ever seen — clear, opinionated, and always grounded in evidence. He made engineers feel heard and valued.',
  5, true, 'approved', 0
),
(
  'b1000000-0000-0000-0000-000000000003',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Priya Sharma',
  'Head of Growth',
  'Healthara',
  'priya.sharma@example.com',
  'Former colleague',
  ARRAY['Growth mindset', 'User empathy', 'Execution'],
  'Nick joined Healthara at a critical inflection point and brought exactly the product rigour we needed. He ran discovery, aligned clinical and commercial stakeholders, and shipped a v1 in 4 months. Rare combination of strategic and execution skills.',
  4, true, 'approved', 0
)
ON CONFLICT (id) DO NOTHING;
