-- Remove star_rating from vouches — feature was removed from the product.
-- Run this once in the Supabase SQL editor.

ALTER TABLE public.vouches
  ALTER COLUMN star_rating DROP NOT NULL,
  ALTER COLUMN star_rating SET DEFAULT NULL;
