-- Explicit Data API grants (required from May 30, 2026 for new Supabase projects;
-- enforced on all existing projects from October 30, 2026).
-- Without these, PostgREST/supabase-js returns a 42501 permission error.
-- RLS policies already control row-level access — these grants just open the door.

-- ─── PROFILES ──────────────────────────────────────────────────────────────
-- anon  : can read public profiles (RLS allows all rows)
-- authenticated : full CRUD (RLS restricts writes to own row)
-- service_role  : unrestricted (used by server-side API routes)
GRANT SELECT
  ON public.profiles
  TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.profiles
  TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.profiles
  TO service_role;

-- ─── VOUCHES ───────────────────────────────────────────────────────────────
-- anon  : SELECT (public read of approved vouches) + INSERT (vouch givers are unauthenticated)
-- authenticated : full CRUD (owner manages their vouches; RLS enforces ownership)
-- service_role  : unrestricted
GRANT SELECT, INSERT
  ON public.vouches
  TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.vouches
  TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.vouches
  TO service_role;

-- ─── FLAGS ─────────────────────────────────────────────────────────────────
-- anon  : INSERT only (anyone can flag a vouch)
-- authenticated : SELECT (owner reads flags on their own vouches) + INSERT
-- service_role  : unrestricted
GRANT INSERT
  ON public.flags
  TO anon;

GRANT SELECT, INSERT
  ON public.flags
  TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.flags
  TO service_role;

-- ─── PROFILE_STATS VIEW ────────────────────────────────────────────────────
-- This view is read-only by design — no writes needed
GRANT SELECT
  ON public.profile_stats
  TO anon;

GRANT SELECT
  ON public.profile_stats
  TO authenticated;

GRANT SELECT
  ON public.profile_stats
  TO service_role;

-- ─── SITE_SETTINGS ─────────────────────────────────────────────────────────
-- Intentionally NOT granted to anon/authenticated — accessed only via
-- service_role from server-side API routes. Already has REVOKE ALL in
-- migration-site-settings.sql.

-- ─── WAITLIST ──────────────────────────────────────────────────────────────
-- Already granted INSERT in migration-waitlist.sql. Re-stating here for
-- completeness and idempotency (GRANT is safe to run multiple times).
GRANT INSERT
  ON public.waitlist
  TO anon, authenticated;
