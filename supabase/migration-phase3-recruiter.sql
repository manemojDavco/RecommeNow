-- Recruiter plan migration — run after migration-phase3.sql

alter table profiles
  add column if not exists recruiter_active          boolean not null default false,
  add column if not exists recruiter_subscription_id text;

create index if not exists profiles_recruiter_sub_idx on profiles(recruiter_subscription_id);
