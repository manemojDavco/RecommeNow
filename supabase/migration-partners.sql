-- ═══════════════════════════════════════════════════════════════════════════
-- Partner Program — Sprint 1: attribution rails
-- ═══════════════════════════════════════════════════════════════════════════
-- External partners (recruiters, influencers, student ambassadors) refer users
-- and earn commission. Attribution lives on the account (written once, never
-- changed). Commission is computed on CLEARED, non-refunded net revenue, 30 days
-- in arrears. Additive + idempotent — safe to run any time.

-- ── partners ────────────────────────────────────────────────────────────────
create table if not exists partners (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  email         text not null,
  code          text not null unique,                         -- recommenow.com/r/CODE
  partner_type  text not null check (partner_type in ('recruiter','influencer','student')),
  currency      text not null default 'usd' check (currency in ('usd','aud','gbp','eur')),
  -- Commission config, stored explicitly per partner so a payout can always be
  -- reproduced from the row itself (dispute-proof), independent of app defaults.
  share_pct     numeric  not null default 0,                  -- recurring % of net (recruiter = 20)
  share_months  integer  not null default 0,                  -- eligibility window (recruiter = 12)
  bounty_cents  integer  not null default 0,                  -- flat per-conversion bounty (influencer/student)
  status        text not null default 'pending' check (status in ('pending','active','paused','ended')),
  -- Optional link to a Clerk identity so the partner can log in to the dashboard
  -- (Sprint 2). Nullable until the partner creates/links an account.
  user_id       text,
  notes         text,
  created_at    timestamptz default now()
);
create index if not exists partners_code_idx    on partners(lower(code));
create index if not exists partners_user_id_idx on partners(user_id);

-- ── attribution on the account (write-once) ─────────────────────────────────
alter table profiles add column if not exists referred_by_partner_id uuid references partners(id);
alter table profiles add column if not exists referred_at            timestamptz;
create index if not exists profiles_referred_by_partner_idx on profiles(referred_by_partner_id);

-- Lock attribution: once a partner is set on a profile it can never change.
-- One user, one referrer, for the life of the account. Silently keeps the
-- original values rather than erroring, so unrelated profile updates never fail.
create or replace function lock_partner_attribution() returns trigger as $$
begin
  if OLD.referred_by_partner_id is not null then
    NEW.referred_by_partner_id := OLD.referred_by_partner_id;
    NEW.referred_at            := OLD.referred_at;
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists profiles_lock_partner_attr on profiles;
create trigger profiles_lock_partner_attr
  before update on profiles
  for each row execute function lock_partner_attribution();

-- ── commission_events ───────────────────────────────────────────────────────
-- One row per money event on a referred subscription. Amounts in the smallest
-- currency unit (cents/pence). Refunds are negative. share_due_cents is filled
-- by the nightly clearing job once the 30-day window passes.
create table if not exists commission_events (
  id                uuid primary key default uuid_generate_v4(),
  partner_id        uuid not null references partners(id),
  profile_id        uuid references profiles(id) on delete set null,
  user_id           text,                                     -- Clerk id snapshot
  subscription_id   text,                                     -- stripe sub id / apple original tx id
  source            text not null check (source in ('stripe','apple')),
  event_type        text not null check (event_type in ('conversion','renewal','refund')),
  plan              text,
  currency          text not null,
  gross_cents       integer not null default 0,               -- amount billed (signed)
  fee_cents         integer not null default 0,               -- processor fee
  net_cents         integer not null default 0,               -- gross - fee (signed)
  share_due_cents   integer not null default 0,               -- computed at clearing
  period            text,                                     -- YYYY-MM of the payment
  occurred_at       timestamptz not null default now(),
  clear_at          timestamptz,                              -- occurred_at + 30 days
  status            text not null default 'pending' check (status in ('pending','cleared','paid','void')),
  external_event_id text unique,                              -- idempotency key (invoice/charge/tx id)
  payout_id         uuid,
  created_at        timestamptz default now()
);
create index if not exists commission_events_partner_idx on commission_events(partner_id);
create index if not exists commission_events_status_idx  on commission_events(status);
create index if not exists commission_events_clear_idx   on commission_events(clear_at) where status = 'pending';
create index if not exists commission_events_period_idx  on commission_events(partner_id, period);

-- ── payouts ─────────────────────────────────────────────────────────────────
create table if not exists payouts (
  id            uuid primary key default uuid_generate_v4(),
  partner_id    uuid not null references partners(id),
  period        text not null,                                -- YYYY-MM
  currency      text not null,
  total_cents   integer not null default 0,
  statement_url text,
  status        text not null default 'draft' check (status in ('draft','sent','paid')),
  paid_at       timestamptz,
  created_at    timestamptz default now(),
  unique(partner_id, period)
);
create index if not exists payouts_partner_idx on payouts(partner_id);

-- ── RLS ─────────────────────────────────────────────────────────────────────
-- Deny-by-default. All writes go through the service-role key (which bypasses
-- RLS). Partner-scoped read policies for the dashboard are added in Sprint 2.
alter table partners          enable row level security;
alter table commission_events enable row level security;
alter table payouts           enable row level security;
