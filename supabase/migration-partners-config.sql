-- ═══════════════════════════════════════════════════════════════════════════
-- Partner program — run-once config catch-up (SAFE TO RE-RUN)
-- ═══════════════════════════════════════════════════════════════════════════
-- Combines the two follow-up migrations. Every statement is idempotent, so
-- running it again when parts are already applied changes nothing. Paste the
-- whole thing into Supabase → SQL Editor → Run.

-- 1) Sprint 3 notification-tracking columns (welcome / first-signup / digest /
--    milestone / inactivity state). Without these the partner emails can repeat
--    or not fire.
alter table partners add column if not exists welcomed_at              timestamptz;
alter table partners add column if not exists first_signup_notified_at timestamptz;
alter table partners add column if not exists last_digest_at           timestamptz;
alter table partners add column if not exists last_milestone           integer not null default 0;
alter table partners add column if not exists last_nudge_at            timestamptz;

-- 2) Clears the Supabase linter "Function Search Path Mutable" warning.
alter function public.lock_partner_attribution() set search_path = '';
