-- Phase 2 migration — run in Supabase SQL editor after schema.sql

alter table profiles
  add column if not exists plan text not null default 'free'
    check (plan in ('free', 'pro')),
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

create index if not exists profiles_stripe_customer_idx on profiles(stripe_customer_id);
