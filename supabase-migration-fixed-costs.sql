-- ============================================================================
-- Migration: Laura rename + category cleanup + Fixed Costs (recurring expenses)
-- ----------------------------------------------------------------------------
-- Run this ONCE in the Supabase SQL Editor (after supabase-setup.sql).
-- Safe to re-run: every statement is idempotent / guarded.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Rename the partner profile to Laura
-- ----------------------------------------------------------------------------
update profiles
  set display_name = 'Laura'
  where id = '22222222-2222-2222-2222-222222222222';

-- ----------------------------------------------------------------------------
-- 2. Categories: keep Rent, Electricity, Netflix, Disney, Internet
-- ----------------------------------------------------------------------------
-- Make sure Disney exists (it wasn't in the original seed).
insert into expense_types (name, created_by)
select 'Disney', '11111111-1111-1111-1111-111111111111'
where not exists (select 1 from expense_types where name = 'Disney');

-- Remove the categories we no longer want. Any expenses referencing them are
-- deleted first so the foreign key doesn't block the delete. (At this stage
-- there should only be test data, if anything.)
delete from expenses
  where expense_type_id in (
    select id from expense_types
    where name in ('Groceries', 'Water', 'Phone', 'Insurance', 'Dining out')
  );

delete from expense_types
  where name in ('Groceries', 'Water', 'Phone', 'Insurance', 'Dining out');

-- ----------------------------------------------------------------------------
-- 3. recurring_expenses — the "fixed cost" templates
-- ----------------------------------------------------------------------------
create table if not exists recurring_expenses (
  id              uuid primary key default gen_random_uuid(),
  amount          numeric(12, 2) not null check (amount > 0),
  expense_type_id uuid references expense_types (id),
  paid_by         uuid not null references profiles (id),
  paid_from       text not null check (paid_from in ('personal', 'joint')),
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

-- Link generated expenses back to the template they came from. ON DELETE SET
-- NULL means deleting a template leaves past expenses intact (just unlinked).
alter table expenses
  add column if not exists recurring_id uuid
  references recurring_expenses (id) on delete set null;

-- Tracks which (template, month) pairs have already been auto-filled, so a
-- fixed cost is seeded into a month at most once — even if you later delete it
-- for that month, it won't silently reappear.
create table if not exists recurring_seeded (
  recurring_id uuid not null references recurring_expenses (id) on delete cascade,
  month        text not null,  -- 'YYYY-MM'
  created_at   timestamptz not null default now(),
  primary key (recurring_id, month)
);

-- ----------------------------------------------------------------------------
-- 4. Row level security (same permissive "no-auth" model as the rest)
-- ----------------------------------------------------------------------------
alter table recurring_expenses enable row level security;
alter table recurring_seeded   enable row level security;

drop policy if exists "open access" on recurring_expenses;
drop policy if exists "open access" on recurring_seeded;

create policy "open access" on recurring_expenses
  for all to anon, authenticated using (true) with check (true);
create policy "open access" on recurring_seeded
  for all to anon, authenticated using (true) with check (true);

-- ----------------------------------------------------------------------------
-- 5. Seed your fixed costs
-- ----------------------------------------------------------------------------
-- Daniel = 1111…, Laura = 2222…. Categories are looked up by name.
-- Guarded by "not exists" so re-running won't create duplicates.
insert into recurring_expenses (amount, expense_type_id, paid_by, paid_from)
select v.amount,
       (select id from expense_types where name = v.type_name),
       v.paid_by::uuid,
       v.paid_from
from (values
  (1462.00, 'Rent',     '22222222-2222-2222-2222-222222222222', 'joint'),
  (  22.00, 'Netflix',  '22222222-2222-2222-2222-222222222222', 'personal'),
  (  17.00, 'Disney',   '11111111-1111-1111-1111-111111111111', 'personal'),
  (  63.00, 'Internet', '11111111-1111-1111-1111-111111111111', 'personal')
) as v(amount, type_name, paid_by, paid_from)
where not exists (select 1 from recurring_expenses);

-- Done. The app handles filling each month from these templates.
-- ============================================================================
