-- ============================================================
--  RecommeNow — Production Database Setup
--  Run this once in the Supabase SQL Editor on your PRODUCTION project.
--  Safe to re-run (all statements are idempotent).
--  NO seed / demo / test data is included.
-- ============================================================


-- ─── EXTENSIONS ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text LANGUAGE sql STABLE SET search_path = '' AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_referral_count(referrer_user_id text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  UPDATE public.profiles SET referral_count = referral_count + 1 WHERE user_id = referrer_user_id;
$$;
REVOKE ALL     ON FUNCTION public.increment_referral_count(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_referral_count(text) FROM anon, authenticated;


-- ─── PROFILES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                        uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   text        NOT NULL UNIQUE,
  name                      text        NOT NULL,
  slug                      text        NOT NULL UNIQUE,
  title                     text,
  years_experience          text,
  location                  text,
  remote_preference         text,
  bio                       text,
  industries                text[]      DEFAULT '{}',
  stages                    text[]      DEFAULT '{}',
  plan                      text        NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro')),
  pro_trial_until           timestamptz,
  stripe_customer_id        text,
  stripe_subscription_id    text,
  recruiter_active          boolean     NOT NULL DEFAULT false,
  recruiter_subscription_id text,
  referral_code             text        UNIQUE,
  referred_by               text,
  referral_count            int         NOT NULL DEFAULT 0,
  availability              text,
  photo_url                 text,
  linkedin_url              text,
  phone                     text,
  contact_email             text,
  show_phone                boolean     NOT NULL DEFAULT true,
  show_linkedin             boolean     NOT NULL DEFAULT true,
  show_contact_email        boolean     NOT NULL DEFAULT true,
  show_working_pref         boolean     NOT NULL DEFAULT true,
  show_availability         boolean     NOT NULL DEFAULT true,
  push_token                text        DEFAULT NULL,
  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_slug_idx            ON public.profiles(slug);
CREATE INDEX IF NOT EXISTS profiles_user_id_idx         ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_stripe_customer_idx ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS profiles_referral_code_idx   ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS profiles_recruiter_sub_idx   ON public.profiles(recruiter_subscription_id);
CREATE INDEX IF NOT EXISTS profiles_push_token_idx      ON public.profiles(push_token) WHERE push_token IS NOT NULL;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Back-fill referral codes for any existing profiles
UPDATE public.profiles
SET referral_code = substr(encode(gen_random_bytes(4), 'hex'), 1, 8)
WHERE referral_code IS NULL;


-- ─── VOUCHES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vouches (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  giver_name           text NOT NULL,
  giver_title          text,
  giver_company        text,
  giver_email          text NOT NULL,
  giver_relationship   text,
  traits               text[] DEFAULT '{}',
  quote                text NOT NULL,
  star_rating          int  NOT NULL CHECK (star_rating BETWEEN 1 AND 5),
  verified             boolean DEFAULT false,
  verification_token   text UNIQUE,
  status               text DEFAULT 'pending' CHECK (status IN ('pending','approved','hidden','flagged')),
  flag_count           int  DEFAULT 0,
  display_order        integer,
  created_at           timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vouches_profile_id_idx        ON public.vouches(profile_id);
CREATE INDEX IF NOT EXISTS vouches_status_idx            ON public.vouches(status);
CREATE INDEX IF NOT EXISTS vouches_verification_token_idx ON public.vouches(verification_token);


-- ─── FLAGS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.flags (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vouch_id       uuid NOT NULL REFERENCES public.vouches(id) ON DELETE CASCADE,
  reason         text NOT NULL,
  reporter_email text,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS flags_vouch_id_idx ON public.flags(vouch_id);


-- ─── WAITLIST ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.waitlist (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text    NOT NULL UNIQUE,
  source     text    DEFAULT 'coming-soon',
  position   integer,
  created_at timestamptz DEFAULT now()
);

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

-- Advance sequence to current max so new signups continue correctly
SELECT setval('public.waitlist_position_seq',
  COALESCE((SELECT MAX(position) FROM public.waitlist), 0)
);


-- ─── SITE SETTINGS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  key        text PRIMARY KEY,
  value      text,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.site_settings (key, value) VALUES
  ('coming_soon',          'true'),
  ('hero_headline_1',      'Don''t just apply.'),
  ('hero_headline_2',      'Get vouched.'),
  ('hero_sub',             'Verified peer endorsements from real colleagues, managers and clients. Shared anywhere you apply.'),
  ('hero_tagline',         'The vouch that opens the door.'),
  ('announcement_enabled', 'false'),
  ('announcement_text',    ''),
  ('announcement_color',   'green'),
  ('maintenance_mode',     'false'),
  ('feature_directory',    'true'),
  ('feature_recruiter',    'true'),
  ('feature_pro_plan',     'true')
ON CONFLICT (key) DO NOTHING;


-- ─── VIEWS ───────────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS public.public_directory;
DROP VIEW IF EXISTS public.profile_stats;

CREATE OR REPLACE VIEW public.profile_stats WITH (security_invoker = true) AS
SELECT
  p.id AS profile_id,
  p.slug,
  COUNT(v.id) FILTER (WHERE v.status = 'approved') AS approved_count,
  ROUND(AVG(v.star_rating) FILTER (WHERE v.status = 'approved')::numeric, 1) AS trust_score,
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
  p.photo_url,
  COALESCE(p.plan, 'free')            AS plan,
  COALESCE(p.recruiter_active, false) AS recruiter_active,
  COALESCE(ps.approved_count, 0)      AS vouch_count,
  COALESCE(ps.trust_score, 0)         AS trust_score,
  COALESCE(ps.verification_rate, 0)   AS verification_rate
FROM public.profiles p
LEFT JOIN public.profile_stats ps ON ps.profile_id = p.id
WHERE COALESCE(ps.approved_count, 0) > 0;


-- ─── PRO TRIAL HELPERS ───────────────────────────────────────────────────────
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


-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_public_read"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_write"  ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_owner_write" ON public.profiles FOR ALL
  USING (user_id = public.requesting_user_id())
  WITH CHECK (user_id = public.requesting_user_id());

-- vouches
ALTER TABLE public.vouches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vouches_public_read"   ON public.vouches;
DROP POLICY IF EXISTS "vouches_public_insert" ON public.vouches;
DROP POLICY IF EXISTS "vouches_owner_read"    ON public.vouches;
DROP POLICY IF EXISTS "vouches_owner_update"  ON public.vouches;
CREATE POLICY "vouches_public_read"   ON public.vouches FOR SELECT USING (status = 'approved');
CREATE POLICY "vouches_public_insert" ON public.vouches FOR INSERT WITH CHECK (status = 'pending');
CREATE POLICY "vouches_owner_read"    ON public.vouches FOR SELECT
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = public.requesting_user_id()));
CREATE POLICY "vouches_owner_update"  ON public.vouches FOR UPDATE
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = public.requesting_user_id()));

-- flags
ALTER TABLE public.flags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "flags_public_insert" ON public.flags;
DROP POLICY IF EXISTS "flags_owner_read"    ON public.flags;
CREATE POLICY "flags_public_insert" ON public.flags FOR INSERT
  WITH CHECK (reason IS NOT NULL AND reason <> '');
CREATE POLICY "flags_owner_read" ON public.flags FOR SELECT
  USING (vouch_id IN (
    SELECT v.id FROM public.vouches v
    JOIN public.profiles p ON p.id = v.profile_id
    WHERE p.user_id = public.requesting_user_id()
  ));

-- waitlist
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service role full access" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_public_insert"   ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_anon_insert"     ON public.waitlist;
CREATE POLICY "waitlist_anon_insert" ON public.waitlist FOR INSERT
  WITH CHECK (email IS NOT NULL AND email <> '');

-- site_settings (no policy — service role only)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.site_settings FROM anon, authenticated;


-- ─── STORAGE: AVATARS BUCKET ─────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "avatars_authenticated_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "avatars_authenticated_update" ON storage.objects FOR UPDATE TO authenticated USING  (bucket_id = 'avatars');
CREATE POLICY "avatars_authenticated_delete" ON storage.objects FOR DELETE TO authenticated USING  (bucket_id = 'avatars');


-- ─── EXPLICIT DATA API GRANTS ─────────────────────────────────────────────────
GRANT SELECT                          ON public.profiles     TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.profiles     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.profiles     TO service_role;

GRANT SELECT, INSERT                  ON public.vouches      TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.vouches      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.vouches      TO service_role;

GRANT INSERT                          ON public.flags        TO anon;
GRANT SELECT, INSERT                  ON public.flags        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.flags        TO service_role;

GRANT SELECT                          ON public.profile_stats    TO anon;
GRANT SELECT                          ON public.profile_stats    TO authenticated;
GRANT SELECT                          ON public.profile_stats    TO service_role;

GRANT SELECT                          ON public.public_directory TO anon;
GRANT SELECT                          ON public.public_directory TO authenticated;
GRANT SELECT                          ON public.public_directory TO service_role;

GRANT INSERT                          ON public.waitlist     TO anon, authenticated;
