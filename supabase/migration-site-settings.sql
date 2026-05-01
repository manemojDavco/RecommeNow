CREATE TABLE IF NOT EXISTS site_settings (
  key        text PRIMARY KEY,
  value      text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON site_settings FROM anon, authenticated;

-- Seed defaults
INSERT INTO site_settings (key, value) VALUES
  ('coming_soon',         'true'),
  ('hero_headline_1',     'Don''t just apply.'),
  ('hero_headline_2',     'Get vouched.'),
  ('hero_sub',            'Verified peer endorsements from real colleagues, managers and clients. Shared anywhere you apply.'),
  ('hero_tagline',        'The vouch that opens the door.'),
  ('announcement_enabled','false'),
  ('announcement_text',   ''),
  ('announcement_color',  'green'),
  ('maintenance_mode',    'false'),
  ('feature_directory',   'true'),
  ('feature_recruiter',   'true'),
  ('feature_pro_plan',    'true')
ON CONFLICT (key) DO NOTHING;
