-- Add display_order to vouches (null = not set, ordered last)
ALTER TABLE public.vouches ADD COLUMN IF NOT EXISTS display_order integer;
