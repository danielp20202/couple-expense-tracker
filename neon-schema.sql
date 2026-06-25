-- ============================================================================
-- Neon (Postgres) schema — no Supabase RLS / roles.
-- Run once against the new Neon database (Neon SQL Editor or psql).
-- Data is imported separately (scripts/migrate-to-neon.js).
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

-- ----------------------------------------------------------------------------
-- Household chores. A `chore` is a (usually recurring) definition; occurrences
-- are computed on the fly per week from the recurrence rule (see lib/chores.ts)
-- rather than materialized. A `chore_completion` records that a specific
-- occurrence (chore_id + the occurrence date) was done, by whom and when.
-- ----------------------------------------------------------------------------
create table if not exists chores (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  assigned_to  uuid references profiles (id),            -- null = unassigned / either
  recurrence   text not null default 'weekly'
                 check (recurrence in ('once', 'daily', 'weekly', 'monthly')),
  weekdays     int[] not null default '{}',              -- 0=Sun..6=Sat, for 'weekly'
  day_of_month int,                                      -- 1..31, for 'monthly'
  start_date   date not null default current_date,       -- anchor; occurrences only on/after
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists chore_completions (
  id           uuid primary key default gen_random_uuid(),
  chore_id     uuid not null references chores (id) on delete cascade,
  completed_by uuid references profiles (id),
  completed_on date not null,                             -- the occurrence date
  created_at   timestamptz not null default now(),
  unique (chore_id, completed_on)                         -- one completion per occurrence
);
create index if not exists chore_completions_date_idx on chore_completions (completed_on);
