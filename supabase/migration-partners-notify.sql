-- Partner Program — Sprint 3: notification tracking.
-- State so each partner email fires exactly once / on the right cadence.
-- Additive + idempotent.
alter table partners add column if not exists welcomed_at              timestamptz;
alter table partners add column if not exists first_signup_notified_at timestamptz;
alter table partners add column if not exists last_digest_at           timestamptz;
alter table partners add column if not exists last_milestone           integer not null default 0;
alter table partners add column if not exists last_nudge_at            timestamptz;
