-- Plans v2: FREE lifecycle + grandfathering.
--
-- free_legacy         : true for users who signed up under the old FREE model
--                       (2 vouches, never expires). Grandfathered — no auto-close.
-- free_expires_at     : when a NEW free account's 1-month window ends. NULL for
--                       grandfathered or paid users.
-- free_reminders_sent : which pre-expiry reminders (10/5/1 days) have been sent,
--                       so the cron never double-sends.
-- account_closed_at   : set when a FREE account auto-closes after expiry without
--                       subscribing. A soft close — data is retained; the account
--                       reopens on subscribing. Nothing is deleted here.

alter table public.profiles add column if not exists free_legacy boolean not null default false;
alter table public.profiles add column if not exists free_expires_at timestamptz;
alter table public.profiles add column if not exists free_reminders_sent integer[] not null default '{}';
alter table public.profiles add column if not exists account_closed_at timestamptz;

-- Grandfather every EXISTING account so the new 1-vouch / auto-close rules apply
-- only to new signups. Run once.
update public.profiles set free_legacy = true where free_legacy = false;

create index if not exists profiles_free_expiry_idx
  on public.profiles (free_expires_at)
  where free_expires_at is not null and account_closed_at is null;
