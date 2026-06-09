-- Device approval table for push-to-approve login feature
CREATE TABLE IF NOT EXISTS device_approvals (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id  uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id  text NOT NULL,
  token       uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  status      text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  device_info jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now(),
  expires_at  timestamptz DEFAULT (now() + interval '10 minutes')
);

-- Index for fast lookups by session
CREATE INDEX IF NOT EXISTS device_approvals_session_idx ON device_approvals(session_id);
CREATE INDEX IF NOT EXISTS device_approvals_token_idx ON device_approvals(token);

-- Auto-clean expired rows after 24 hours (optional, run via cron or manually)
-- DELETE FROM device_approvals WHERE expires_at < now() - interval '24 hours';

-- Service role can do everything (already has full access)
-- No RLS needed since we only access via service client
