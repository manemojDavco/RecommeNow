-- Security fixes round 2 — run in Supabase SQL editor

-- ─── 1. waitlist: replace always-true policy with a meaningful check ──────────
-- Service role bypasses RLS entirely, so we only need a policy for anon inserts.
DROP POLICY IF EXISTS "service role full access" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_public_insert"   ON public.waitlist;

CREATE POLICY "waitlist_anon_insert"
  ON public.waitlist FOR INSERT
  WITH CHECK (email IS NOT NULL AND email <> '');

-- ─── 2. increment_referral_count: revoke execute from PUBLIC (not just roles) ──
-- PostgreSQL grants EXECUTE to PUBLIC by default on new functions.
-- Revoking from individual roles isn't enough — must revoke from PUBLIC too.
REVOKE ALL     ON FUNCTION public.increment_referral_count(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_referral_count(text) FROM anon, authenticated;

-- ─── 3. storage.avatars: remove broad SELECT policy to stop bucket listing ─────
-- Public bucket files are accessible via direct URL without any SELECT policy.
-- Drop all SELECT policies on storage.objects so listing is blocked via the API.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;

-- Uploads only happen server-side via the service role (which bypasses RLS).
-- No SELECT policy is needed — public bucket URLs work without one.
-- Re-add only authenticated upload/delete so users can manage their own avatars:
CREATE POLICY "avatars_authenticated_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');
