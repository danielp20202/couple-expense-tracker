-- ============================================================================
-- Couple Expense Tracker — Supabase setup
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Run it top to bottom once. The SEED section near the bottom is the only part
-- you should edit (put your real names in).
-- ============================================================================

-- gen_random_uuid() lives here (usually already enabled on Supabase).
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- TABLES
-- ----------------------------------------------------------------------------

-- The two people sharing expenses. No auth in this version, so this is a
-- standalone table (not tied to auth.users). They are linked to each other via
-- partner_id.
create table if not exists profiles (
  id           uuid primary key default gen_random_uuid(),
  display_name text,
  partner_id   uuid references profiles (id),
  created_at   timestamptz not null default now()
);

create table if not exists expense_types (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists expenses (
  id              uuid primary key default gen_random_uuid(),
  amount          numeric(12, 2) not null check (amount > 0),
  expense_type_id uuid references expense_types (id), -- restrict delete while in use
  paid_by         uuid not null references profiles (id),
  paid_from       text not null check (paid_from in ('personal', 'joint')),
  date            date not null default current_date,
  note            text,
  created_at      timestamptz not null default now()
);

create index if not exists expenses_date_idx on expenses (date);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
-- NO-AUTH MODE: the app talks to Supabase with the public anon key, so we allow
-- the anon (and authenticated) roles full access. This is acceptable for a
-- PRIVATE deployment that isn't publicly advertised, but be aware: anyone who
-- has your project URL + anon key could read/write this data.
--
-- When you add Supabase Auth later, DROP these policies and replace them with
-- ones scoped to auth.uid() / the couple. See the note at the very bottom.

alter table profiles      enable row level security;
alter table expense_types enable row level security;
alter table expenses      enable row level security;

drop policy if exists "open access" on profiles;
drop policy if exists "open access" on expense_types;
drop policy if exists "open access" on expenses;

create policy "open access" on profiles
  for all to anon, authenticated using (true) with check (true);
create policy "open access" on expense_types
  for all to anon, authenticated using (true) with check (true);
create policy "open access" on expenses
  for all to anon, authenticated using (true) with check (true);

-- ============================================================================
-- SEED  ← EDIT THIS SECTION
-- ============================================================================
-- Put the two of you here. The fixed UUIDs just make linking easy; leave them.
-- Change ONLY the display names.

insert into profiles (id, display_name) values
  ('11111111-1111-1111-1111-111111111111', 'Daniel'),
  ('22222222-2222-2222-2222-222222222222', 'Partner')
on conflict (id) do nothing;

-- Link them as partners (both directions).
update profiles set partner_id = '22222222-2222-2222-2222-222222222222'
  where id = '11111111-1111-1111-1111-111111111111';
update profiles set partner_id = '11111111-1111-1111-1111-111111111111'
  where id = '22222222-2222-2222-2222-222222222222';

-- A starter set of categories (created by the first person). Edit freely.
insert into expense_types (name, created_by)
select name, '11111111-1111-1111-1111-111111111111'
from (values
  ('Rent'), ('Groceries'), ('Electricity'), ('Internet'),
  ('Water'), ('Netflix'), ('Phone'), ('Insurance'), ('Dining out')
) as t(name)
where not exists (select 1 from expense_types);

-- ============================================================================
-- LATER: locking down with real auth
-- ----------------------------------------------------------------------------
-- When you add Supabase Auth, you'd typically:
--   1. Make profiles.id reference auth.users(id) and create a row on signup.
--   2. Replace the "open access" policies above with policies like:
--
--      create policy "couple can read" on expenses
--        for select to authenticated
--        using (
--          paid_by in (
--            select id from profiles
--            where id = auth.uid() or partner_id = auth.uid()
--               or id = (select partner_id from profiles where id = auth.uid())
--          )
--        );
--
--   (and matching insert/update/delete policies). Left as a comment for now.
-- ============================================================================
