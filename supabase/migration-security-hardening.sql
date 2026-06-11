-- Security hardening — addresses the Supabase Security Advisor warnings.
-- Idempotent: safe to run multiple times. Run once in the Supabase SQL Editor.
--
-- Covers:
--   1. increment_referral_count — pin search_path (was "mutable", a privilege
--      vector for SECURITY DEFINER functions) and lock EXECUTE to service_role.
--   2. waitlist — replace any always-true RLS policy with anon-insert-only.
--   3. storage.avatars — drop broad SELECT policies so the bucket can't be
--      listed (files stay reachable by direct URL).

-- ─── 1. increment_referral_count ────────────────────────────────────────────
-- Recreate with an explicit, immutable search_path. SECURITY DEFINER functions
-- without a fixed search_path can be hijacked via search_path manipulation.
CREATE OR REPLACE FUNCTION public.increment_referral_count(referrer_user_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles
     SET referral_count = referral_count + 1
   WHERE user_id = referrer_user_id;
$$;

-- Only the backend (service role) may call it. Postgres grants EXECUTE to
-- PUBLIC by default on (re)created functions, so revoke that explicitly.
REVOKE ALL     ON FUNCTION public.increment_referral_count(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_referral_count(text) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.increment_referral_count(text) TO service_role;

-- ─── 2. waitlist RLS ──────────────────────────────────────────────────────────
-- Service role bypasses RLS, so the only policy we need is anon INSERT for the
-- public sign-up form. Drop any permissive/always-true policies first.
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service role full access" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_public_insert"   ON public.waitlist;
DROP POLICY IF EXISTS "Enable insert for all"    ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_anon_insert"     ON public.waitlist;

CREATE POLICY "waitlist_anon_insert"
  ON public.waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);   -- INSERT-only; no SELECT/UPDATE/DELETE for these roles

-- ─── 3. storage.avatars — block bucket listing ────────────────────────────────
-- Public files remain accessible by direct URL; we only remove the ability to
-- enumerate the bucket via a broad SELECT policy.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;
