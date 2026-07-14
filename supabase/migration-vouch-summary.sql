-- Talent directory: AI summary of the vouches PUBLISHED on a profile.
-- vouch_summary_key is a fingerprint of the published vouch set — when the user
-- changes which vouches are live (approve/hide/reorder, or a plan change moves
-- the cap), the key changes and the summary is regenerated automatically.
-- Additive + idempotent.
alter table profiles add column if not exists vouch_summary     text;
alter table profiles add column if not exists vouch_summary_key text;
