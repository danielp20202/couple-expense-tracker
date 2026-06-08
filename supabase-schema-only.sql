-- ============================================================================
-- Schema only — NO seed data.
-- Use this when migrating to a fresh Supabase project: it creates the tables,
-- constraints, indexes, and RLS policies, but inserts no rows (your real data
-- is copied in separately). Run once in the new project's SQL Editor.
-- ============================================================================

create extension if not exists pgcrypto;

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

create table if not exists recurring_expenses (
  id              uuid primary key default gen_random_uuid(),
  amount          numeric(12, 2) not null check (amount > 0),
  expense_type_id uuid references expense_types (id),
  paid_by         uuid not null references profiles (id),
  paid_from       text not null check (paid_from in ('personal', 'joint')),
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

create table if not exists expenses (
  id              uuid primary key default gen_random_uuid(),
  amount          numeric(12, 2) not null check (amount > 0),
  expense_type_id uuid references expense_types (id),
  paid_by         uuid not null references profiles (id),
  paid_from       text not null check (paid_from in ('personal', 'joint')),
  date            date not null default current_date,
  note            text,
  recurring_id    uuid references recurring_expenses (id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists expenses_date_idx on expenses (date);

create table if not exists recurring_seeded (
  recurring_id uuid not null references recurring_expenses (id) on delete cascade,
  month        text not null,
  created_at   timestamptz not null default now(),
  primary key (recurring_id, month)
);

create table if not exists settlements (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles (id),
  amount      numeric(12, 2) not null check (amount > 0),
  date        date not null default current_date,
  created_at  timestamptz not null default now()
);
create index if not exists settlements_date_idx on settlements (date);

-- Row level security (same permissive "no-auth" model as the original setup).
alter table profiles          enable row level security;
alter table expense_types     enable row level security;
alter table recurring_expenses enable row level security;
alter table expenses          enable row level security;
alter table recurring_seeded  enable row level security;
alter table settlements        enable row level security;

drop policy if exists "open access" on profiles;
drop policy if exists "open access" on expense_types;
drop policy if exists "open access" on recurring_expenses;
drop policy if exists "open access" on expenses;
drop policy if exists "open access" on recurring_seeded;
drop policy if exists "open access" on settlements;

create policy "open access" on profiles
  for all to anon, authenticated using (true) with check (true);
create policy "open access" on expense_types
  for all to anon, authenticated using (true) with check (true);
create policy "open access" on recurring_expenses
  for all to anon, authenticated using (true) with check (true);
create policy "open access" on expenses
  for all to anon, authenticated using (true) with check (true);
create policy "open access" on recurring_seeded
  for all to anon, authenticated using (true) with check (true);
create policy "open access" on settlements
  for all to anon, authenticated using (true) with check (true);
