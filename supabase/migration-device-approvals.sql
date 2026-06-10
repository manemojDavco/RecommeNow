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

CREATE INDEX IF NOT EXISTS device_approvals_session_idx ON device_approvals(session_id);
CREATE INDEX IF NOT EXISTS device_approvals_token_idx ON device_approvals(token);

-- Enable RLS with service role access
ALTER TABLE public.device_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role full access" ON public.device_approvals
  FOR ALL TO service_role USING (true) WITH CHECK (true);
