-- Talent directory parity: count + verification rate must reflect only the
-- vouches PUBLISHED on the public profile (plan-capped), not all approved ones.
-- Mirrors the /api/profile/[slug] cap and ordering exactly. Safe to re-run.
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
  COALESCE(p.plan, 'free')            AS plan,
  COALESCE(p.recruiter_active, false) AS recruiter_active,
  capped.vouch_count,
  COALESCE(ps.trust_score, 0)         AS trust_score,
  capped.verification_rate
FROM public.profiles p
LEFT JOIN public.profile_stats ps ON ps.profile_id = p.id
-- Count + verification over only the top-N published vouches for the plan,
-- ordered the same way the public profile publishes them.
LEFT JOIN LATERAL (
  SELECT
    count(*)::int AS vouch_count,
    COALESCE(round(avg(CASE WHEN t.verified THEN 100 ELSE 0 END)), 0)::int AS verification_rate
  FROM (
    SELECT v.verified
    FROM public.vouches v
    WHERE v.profile_id = p.id AND v.status = 'approved'
    ORDER BY v.display_order ASC NULLS LAST, v.created_at DESC
    LIMIT (CASE
      WHEN COALESCE(p.plan, 'free') = 'pro'       THEN 5
      WHEN COALESCE(p.plan, 'free') = 'proplus'   THEN 10
      WHEN COALESCE(p.plan, 'free') = 'recruiter' THEN 5
      WHEN COALESCE(p.plan, 'free') = 'member'    THEN 1
      WHEN COALESCE(p.free_legacy, false)         THEN 2
      ELSE 1
    END)
  ) t
) capped ON true
WHERE capped.vouch_count > 0;
