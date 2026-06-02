-- Migration: user_emails table for connected emails feature
-- Run this in Supabase SQL editor

CREATE TABLE IF NOT EXISTS user_emails (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  verification_token TEXT UNIQUE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email)
);

CREATE INDEX IF NOT EXISTS user_emails_user_id_idx ON user_emails(user_id);
CREATE INDEX IF NOT EXISTS user_emails_email_idx ON user_emails(email);
CREATE INDEX IF NOT EXISTS user_emails_token_idx ON user_emails(verification_token);

-- Enable RLS (service role bypasses it for API routes)
ALTER TABLE user_emails ENABLE ROW LEVEL SECURITY;
