-- Adds Apple IAP transaction tracking columns to profiles table.
-- Run this migration in Supabase SQL Editor before deploying IAP support.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS iap_transaction_id text,
  ADD COLUMN IF NOT EXISTS iap_product_id      text;
