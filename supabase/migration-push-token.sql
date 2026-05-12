-- Add push_token column to profiles for mobile push notifications
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS push_token TEXT DEFAULT NULL;

-- Index for quick lookups (used when looking up tokens to send notifications)
CREATE INDEX IF NOT EXISTS profiles_push_token_idx ON profiles (push_token)
  WHERE push_token IS NOT NULL;
