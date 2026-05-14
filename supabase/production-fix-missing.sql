-- ============================================================
--  RecommeNow — Production Fix: Missing Columns & Functions
--  Run this in the Supabase SQL Editor on your PRODUCTION project.
--  Safe to re-run (all statements are idempotent).
-- ============================================================


-- ─── MISSING COLUMNS ─────────────────────────────────────────────────────────

-- profiles: pro_trial_until
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pro_trial_until timestamptz;

-- waitlist: position
ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS position integer;


-- ─── WAITLIST POSITION SEQUENCE & TRIGGER ────────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS public.waitlist_position_seq START 1;

CREATE OR REPLACE FUNCTION public.assign_waitlist_position()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.position := nextval('public.waitlist_position_seq');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS waitlist_position_trigger ON public.waitlist;
CREATE TRIGGER waitlist_position_trigger
  BEFORE INSERT ON public.waitlist
  FOR EACH ROW EXECUTE FUNCTION public.assign_waitlist_position();

-- Advance sequence past any existing rows
SELECT setval(
  'public.waitlist_position_seq',
  COALESCE((SELECT MAX(position) FROM public.waitlist), 0)
);


-- ─── UPDATED_AT TRIGGER FUNCTION ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ─── PRO TRIAL HELPER FUNCTIONS ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.grant_pro_trial(p_profile_id uuid, p_days int DEFAULT 30)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  UPDATE public.profiles
  SET plan = 'pro', pro_trial_until = now() + (p_days || ' days')::interval
  WHERE id = p_profile_id AND plan = 'free';
$$;
REVOKE ALL     ON FUNCTION public.grant_pro_trial(uuid, int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.grant_pro_trial(uuid, int) FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.expire_pro_trials()
RETURNS int LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
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
