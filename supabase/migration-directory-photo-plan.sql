-- Add photo_url, plan and recruiter_active to public_directory view
-- Must DROP first — CREATE OR REPLACE cannot add/reorder columns in PostgreSQL
DROP VIEW IF EXISTS public.public_directory;

CREATE VIEW public.public_directory WITH (security_invoker = true) AS
SELECT
  p.id,
  p.slug,
  p.name,
  p.title,
  p.location,
  p.remote_preference,
  p.industries,
  p.stages,
  p.created_at,
  p.photo_url,
  COALESCE(p.plan, 'free')                AS plan,
  COALESCE(p.recruiter_active, false)     AS recruiter_active,
  COALESCE(ps.approved_count, 0)          AS vouch_count,
  COALESCE(ps.trust_score, 0)             AS trust_score,
  COALESCE(ps.verification_rate, 0)       AS verification_rate
FROM public.profiles p
LEFT JOIN public.profile_stats ps ON ps.profile_id = p.id
WHERE COALESCE(ps.approved_count, 0) > 0;
