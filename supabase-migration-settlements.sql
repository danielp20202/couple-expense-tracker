-- ============================================================================
-- Migration: settlements ledger (replaces transfer_status)
-- ----------------------------------------------------------------------------
-- A `settlement` records an amount the rent holder (Laura) has transferred from
-- the joint account to her personal account. The dashboard's running balance is:
--   (all expenses ÷ 2) − (Daniel's personal-paid) − (sum of settlements),
-- cumulative across months (carry-over). Run once in the Supabase SQL Editor.
-- Idempotent / safe to re-run.
-- ============================================================================

create table if not exists settlements (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles (id),
  amount      numeric(12, 2) not null check (amount > 0),
  date        date not null default current_date,
  created_at  timestamptz not null default now()
);

create index if not exists settlements_date_idx on settlements (date);

alter table settlements enable row level security;
drop policy if exists "open access" on settlements;
create policy "open access" on settlements
  for all to anon, authenticated using (true) with check (true);

-- Retire the old checkbox-state table (superseded by settlements).
drop table if exists transfer_status;
