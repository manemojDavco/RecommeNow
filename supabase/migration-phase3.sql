-- Phase 3 migration — run in Supabase SQL editor after migration-phase2.sql

-- Referral tracking
alter table profiles
  add column if not exists referral_code text unique,
  add column if not exists referred_by   text,   -- user_id of the referrer
  add column if not exists referral_count int not null default 0;

-- Back-fill referral codes for existing profiles (8-char hex)
update profiles
set referral_code = substr(encode(gen_random_bytes(4), 'hex'), 1, 8)
where referral_code is null;

create index if not exists profiles_referral_code_idx on profiles(referral_code);

-- RPC to safely increment referral_count
create or replace function increment_referral_count(referrer_user_id text)
returns void as $$
  update profiles set referral_count = referral_count + 1 where user_id = referrer_user_id;
$$ language sql security definer;

-- Public directory view (only profiles with ≥1 approved vouch are listed)
create or replace view public_directory as
select
  p.id,
  p.slug,
  p.name,
  p.title,
  p.location,
  p.remote_preference,
  p.industries,
  p.stages,
  p.created_at,
  coalesce(ps.approved_count, 0)     as vouch_count,
  coalesce(ps.trust_score, 0)        as trust_score,
  coalesce(ps.verification_rate, 0)  as verification_rate
from profiles p
left join profile_stats ps on ps.profile_id = p.id
where coalesce(ps.approved_count, 0) > 0;
