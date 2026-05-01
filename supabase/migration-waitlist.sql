-- Waitlist table for coming-soon email capture
CREATE TABLE IF NOT EXISTS waitlist (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL UNIQUE,
  source     text DEFAULT 'coming-soon',  -- where they signed up from
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Only service role can read; anyone can insert (via API)
CREATE POLICY "service role full access" ON waitlist
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON waitlist FROM anon, authenticated;
GRANT INSERT ON waitlist TO anon, authenticated;
