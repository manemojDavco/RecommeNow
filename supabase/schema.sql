-- RecommeNow Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── HELPER FUNCTION (must be defined first — used in RLS policies) ───────────
-- Extracts the Clerk user ID from the JWT sub claim
create or replace function requesting_user_id() returns text as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ language sql stable;

-- ─── PROFILES ──────────────────────────────────────────────────────────────
create table if not exists profiles (
  id                uuid primary key default uuid_generate_v4(),
  user_id           text not null unique,           -- Clerk user ID
  name              text not null,
  slug              text not null unique,
  title             text,
  years_experience  text,
  location          text,
  remote_preference text,
  bio               text,
  industries        text[] default '{}',
  stages            text[] default '{}',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists profiles_slug_idx on profiles(slug);
create index if not exists profiles_user_id_idx on profiles(user_id);

-- auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- ─── VOUCHES ───────────────────────────────────────────────────────────────
create table if not exists vouches (
  id                   uuid primary key default uuid_generate_v4(),
  profile_id           uuid not null references profiles(id) on delete cascade,
  giver_name           text not null,
  giver_title          text,
  giver_company        text,
  giver_email          text not null,
  giver_relationship   text,
  traits               text[] default '{}',
  quote                text not null,
  star_rating          int not null check (star_rating between 1 and 5),
  verified             boolean default false,
  verification_token   text unique,
  status               text default 'pending'
                         check (status in ('pending','approved','hidden','flagged')),
  flag_count           int default 0,
  created_at           timestamptz default now()
);

create index if not exists vouches_profile_id_idx on vouches(profile_id);
create index if not exists vouches_status_idx on vouches(status);
create index if not exists vouches_verification_token_idx on vouches(verification_token);

-- ─── FLAGS ─────────────────────────────────────────────────────────────────
create table if not exists flags (
  id             uuid primary key default uuid_generate_v4(),
  vouch_id       uuid not null references vouches(id) on delete cascade,
  reason         text not null,
  reporter_email text,
  created_at     timestamptz default now()
);

create index if not exists flags_vouch_id_idx on flags(vouch_id);

-- ─── ROW LEVEL SECURITY ────────────────────────────────────────────────────

-- Profiles
alter table profiles enable row level security;

-- Public read
drop policy if exists "profiles_public_read" on profiles;
create policy "profiles_public_read"
  on profiles for select
  using (true);

-- Owner full access
drop policy if exists "profiles_owner_write" on profiles;
create policy "profiles_owner_write"
  on profiles for all
  using (user_id = requesting_user_id())
  with check (user_id = requesting_user_id());

-- Vouches
alter table vouches enable row level security;

-- Public read: only approved vouches
drop policy if exists "vouches_public_read" on vouches;
create policy "vouches_public_read"
  on vouches for select
  using (status = 'approved');

-- Anyone can insert (vouch givers — unauthenticated)
drop policy if exists "vouches_public_insert" on vouches;
create policy "vouches_public_insert"
  on vouches for insert
  with check (true);

-- Owner can read all their vouches
drop policy if exists "vouches_owner_read" on vouches;
create policy "vouches_owner_read"
  on vouches for select
  using (
    profile_id in (
      select id from profiles where user_id = requesting_user_id()
    )
  );

-- Owner can update vouch status
drop policy if exists "vouches_owner_update" on vouches;
create policy "vouches_owner_update"
  on vouches for update
  using (
    profile_id in (
      select id from profiles where user_id = requesting_user_id()
    )
  );

-- Flags
alter table flags enable row level security;

-- Anyone can insert a flag
drop policy if exists "flags_public_insert" on flags;
create policy "flags_public_insert"
  on flags for insert
  with check (true);

-- Owner can read flags on their own profile's vouches
drop policy if exists "flags_owner_read" on flags;
create policy "flags_owner_read"
  on flags for select
  using (
    vouch_id in (
      select v.id from vouches v
      join profiles p on p.id = v.profile_id
      where p.user_id = requesting_user_id()
    )
  );

-- ─── COMPUTED STATS VIEW ───────────────────────────────────────────────────
create or replace view profile_stats as
select
  p.id as profile_id,
  p.slug,
  count(v.id) filter (where v.status = 'approved') as approved_count,
  round(
    avg(v.star_rating) filter (where v.status = 'approved')::numeric, 1
  ) as trust_score,
  case
    when count(v.id) filter (where v.status = 'approved') = 0 then 0
    else round(
      100.0 *
      count(v.id) filter (where v.status = 'approved' and v.verified = true) /
      count(v.id) filter (where v.status = 'approved')
    )
  end as verification_rate
from profiles p
left join vouches v on v.profile_id = p.id
group by p.id, p.slug;
