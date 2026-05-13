-- Add per-field visibility toggles for the contact info popup
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_phone            boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_linkedin         boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_contact_email    boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_working_pref     boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_availability     boolean NOT NULL DEFAULT true;
