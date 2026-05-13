-- Add contact_email field to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS contact_email text;
