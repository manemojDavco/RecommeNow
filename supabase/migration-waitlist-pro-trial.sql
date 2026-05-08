-- Migration: waitlist position tracking + PRO trial for first 100
-- Run in Supabase SQL editor (production)

-- ─── 1. Add position column to waitlist ──────────────────────────────────────
ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS position integer;

-- Create a dedicated sequence for waitlist positions
CREATE SEQUENCE IF NOT EXISTS public.waitlist_position_seq START 1;

-- Trigger function: auto-assign position on new signups
CREATE OR REPLACE FUNCTION public.assign_waitlist_position()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.position := nextval('public.waitlist_position_seq');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS waitlist_position_trigger ON public.waitlist;
CREATE TRIGGER waitlist_position_trigger
  BEFORE INSERT ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_waitlist_position();

-- Backfill existing rows in signup order
UPDATE public.waitlist SET position = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM public.waitlist
  WHERE position IS NULL
) sub
WHERE public.waitlist.id = sub.id;

-- Advance sequence to current max so new signups continue from the right number
SELECT setval('public.waitlist_position_seq',
  COALESCE((SELECT MAX(position) FROM public.waitlist), 0)
);

-- ─── 2. Add pro_trial_until to profiles ──────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pro_trial_until timestamptz;

-- ─── 3. Helper: grant_pro_trial(profile_id, days) ────────────────────────────
-- Called from the profile-create API when a waitlist signup creates their account.
CREATE OR REPLACE FUNCTION public.grant_pro_trial(
  p_profile_id uuid,
  p_days int DEFAULT 30
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.profiles
  SET
    plan           = 'pro',
    pro_trial_until = now() + (p_days || ' days')::interval
  WHERE id = p_profile_id
    AND plan = 'free';           -- only grant if not already paid pro
$$;

REVOKE ALL     ON FUNCTION public.grant_pro_trial(uuid, int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.grant_pro_trial(uuid, int) FROM anon, authenticated;

-- ─── 4. Cron helper: expire_pro_trials() ─────────────────────────────────────
-- Called daily by /api/cron/expire-trials — resets plan back to free for
-- trial users whose trial has ended AND who have no active Stripe subscription.
CREATE OR REPLACE FUNCTION public.expire_pro_trials()
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH expired AS (
    UPDATE public.profiles
    SET plan = 'free', pro_trial_until = NULL
    WHERE pro_trial_until IS NOT NULL
      AND pro_trial_until < now()
      AND (stripe_subscription_id IS NULL OR stripe_subscription_id = '')
    RETURNING id
  )
  SELECT COUNT(*)::int FROM expired;
$$;

REVOKE ALL     ON FUNCTION public.expire_pro_trials() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.expire_pro_trials() FROM anon, authenticated;
