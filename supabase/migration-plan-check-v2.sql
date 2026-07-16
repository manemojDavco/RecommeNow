-- Plans v2: widen the profiles.plan CHECK constraint.
-- The original constraint (migration-phase2.sql) only allowed ('free','pro'),
-- so 'member', 'proplus' — and 'recruiter' — could not be written. This meant a
-- Member/Pro+ subscription's webhook update would fail and the plan never
-- activated. Additive + safe to re-run.
alter table profiles drop constraint if exists profiles_plan_check;
alter table profiles add constraint profiles_plan_check
  check (plan in ('free', 'member', 'pro', 'proplus', 'recruiter'));
