-- Guideline 1.2 (User-Generated Content) moderation support.
-- 1) profile_reports: lets any signed-out viewer report an objectionable profile
--    (objectionable bio, photo, name) — complements the existing per-vouch flags.
-- 2) profiles.blocked_giver_emails: lets a profile owner block an abusive
--    contributor so their email can no longer submit vouches to that profile.

create table if not exists public.profile_reports (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  reporter_email text,
  created_at timestamptz not null default now()
);

create index if not exists profile_reports_profile_id_idx
  on public.profile_reports (profile_id);

alter table public.profiles
  add column if not exists blocked_giver_emails text[] not null default '{}';

-- RLS: only the service role writes/reads these (the API uses the service client).
alter table public.profile_reports enable row level security;
