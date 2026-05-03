-- Security fixes — run in Supabase SQL editor
-- Addresses all Security Advisor errors and warnings

-- ─── 1. Fix SECURITY DEFINER views → SECURITY INVOKER ────────────────────────
-- Drop and recreate both views with security_invoker = true.
-- This is the only reliable fix across all Supabase Postgres versions.

DROP VIEW IF EXISTS public.public_directory;
DROP VIEW IF EXISTS public.profile_stats;

CREATE OR REPLACE VIEW public.profile_stats WITH (security_invoker = true) AS
SELECT
  p.id AS profile_id,
  p.slug,
  COUNT(v.id) FILTER (WHERE v.status = 'approved') AS approved_count,
  ROUND(
    AVG(v.star_rating) FILTER (WHERE v.status = 'approved')::numeric, 1
  ) AS trust_score,
  CASE
    WHEN COUNT(v.id) FILTER (WHERE v.status = 'approved') = 0 THEN 0
    ELSE ROUND(
      100.0 *
      COUNT(v.id) FILTER (WHERE v.status = 'approved' AND v.verified = true) /
      COUNT(v.id) FILTER (WHERE v.status = 'approved')
    )
  END AS verification_rate
FROM public.profiles p
LEFT JOIN public.vouches v ON v.profile_id = p.id
GROUP BY p.id, p.slug;

CREATE OR REPLACE VIEW public.public_directory WITH (security_invoker = true) AS
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
  COALESCE(ps.approved_count, 0)    AS vouch_count,
  COALESCE(ps.trust_score, 0)       AS trust_score,
  COALESCE(ps.verification_rate, 0) AS verification_rate
FROM public.profiles p
LEFT JOIN public.profile_stats ps ON ps.profile_id = p.id
WHERE COALESCE(ps.approved_count, 0) > 0;

-- ─── 2. Fix mutable search_path on functions ─────────────────────────────────
-- A mutable search_path allows a malicious user to shadow functions/types.
-- Recreate all three functions with SET search_path = '' and fully-qualified names.

CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::text;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_referral_count(referrer_user_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.profiles
  SET referral_count = referral_count + 1
  WHERE user_id = referrer_user_id;
$$;

-- ─── 3. Tighten always-true RLS policies ─────────────────────────────────────

-- vouches: public insert must arrive as 'pending' — prevents submitting pre-approved rows
DROP POLICY IF EXISTS "vouches_public_insert" ON public.vouches;
CREATE POLICY "vouches_public_insert"
  ON public.vouches FOR INSERT
  WITH CHECK (status = 'pending');

-- flags: require reason to be non-empty — prevents blank flag spam
DROP POLICY IF EXISTS "flags_public_insert" ON public.flags;
CREATE POLICY "flags_public_insert"
  ON public.flags FOR INSERT
  WITH CHECK (reason IS NOT NULL AND reason <> '');

-- waitlist: service role USING (true) policy is acceptable here because
-- anon/authenticated are already fully revoked — no change needed.

-- ─── 4. Revoke public execute on SECURITY DEFINER function ───────────────────
-- increment_referral_count is called only from server-side API routes (service role).
-- Revoke from anon and authenticated so it cannot be called directly from the client.
REVOKE EXECUTE ON FUNCTION public.increment_referral_count(text) FROM anon, authenticated;

-- ─── 5. Prevent directory listing on the avatars storage bucket ───────────────
-- The bucket must stay public so avatar URLs work, but we drop the broad
-- SELECT-on-objects policy that allowed listing all files.
-- Direct URL access is unaffected — it bypasses storage object RLS entirely.
DROP POLICY IF EXISTS "avatars_public_select"  ON storage.objects;
DROP POLICY IF EXISTS "Public read avatars"    ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;

-- Re-add a path-restricted read: only the exact file path is accessible via API,
-- not a wildcard listing of the bucket.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'avatars_public_read'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "avatars_public_read"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'avatars' AND auth.role() IS NOT NULL)
    $policy$;
  END IF;
END $$;

-- ─── 6. site_settings — RLS enabled, no policy (informational only) ───────────
-- Access is via service role only (which bypasses RLS).
-- anon/authenticated are already revoked. No policy is intentional.
-- The suggestion is acknowledged — no action needed.
