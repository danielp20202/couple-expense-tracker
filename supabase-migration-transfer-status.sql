-- ============================================================================
-- Migration: transfer_status — tracks whether a month's rent reimbursement has
-- been transferred from the joint account back to the rent holder's account.
-- Run once in the Supabase SQL Editor. Idempotent / safe to re-run.
-- ============================================================================

create table if not exists transfer_status (
  month       text not null,             -- 'YYYY-MM'
  profile_id  uuid not null references profiles (id),
  done        boolean not null default false,
  done_on     date,                      -- the day it was marked done
  updated_at  timestamptz not null default now(),
  primary key (month, profile_id)
);

alter table transfer_status enable row level security;

drop policy if exists "open access" on transfer_status;
create policy "open access" on transfer_status
  for all to anon, authenticated using (true) with check (true);
