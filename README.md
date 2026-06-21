# Couple Expense Tracker

A small Next.js (App Router) + **Neon (Postgres)** web app for a couple sharing
expenses 50/50. It tracks every shared expense — whether paid from a personal
card or the joint account — and keeps a running, carried-over balance of who
owes whom, settled with a tap.

> **Note on auth:** this version has **no login** (per the build brief). The two
> people are seeded directly into the database and linked via `partner_id`. All
> DB access is **server-side only** (server components + server actions) using a
> Neon connection string (`DATABASE_URL`) — never exposed to the browser. Fine
> for a private, unadvertised deployment; add real auth before opening it up.

> **Working on this project?** Two agents collaborate here (an App agent and a
> Visuals agent). Read [`CLAUDE.md`](./CLAUDE.md) for file ownership and the
> branching rules before making changes.

## Working with two agents (git worktrees)

To keep the two agents from clobbering each other's checkout, each works in its
**own git worktree** — separate directories that share the same `.git` history
and remote, so each can sit on a different branch at the same time:

| Directory | Agent | Branch |
| --- | --- | --- |
| `couple-expense-tracker` | Visuals | `visuals/*` |
| `couple-expense-tracker-app` | App | `main`, `feature/*`, `fix/*` |

Create a worktree with `git worktree add <path> <branch>` (e.g.
`git worktree add ../couple-expense-tracker-app main`). Each worktree needs its
own `npm install` and its own `.env.local` — both are gitignored, so they aren't
shared. Commits, branches, and pushes are shared automatically; the only rule is
**don't check out the same branch in two worktrees at once**. Merges to `main`
from either worktree show up everywhere on the next `git fetch`/checkout.

## How the split works

- Every expense is 50/50, so each person's fair share = total ÷ 2.
- Money you paid **personally** counts toward your half.
- Laura fronts the rent; Daniel owes his half. The dashboard shows a single
  **settlement balance** (the one money-flow between you), framed per profile:
  Daniel sees what he deposits / owes, Laura sees what she reclaims.
- The balance is **cumulative and carries across months**:
  `balance = (all expenses ÷ 2) − (depositor's personal-paid) − (settlements)`.
  Positive → the depositor owes / the rent holder reclaims; negative → the
  depositor has covered extra and it rolls into the next rent.
- Tapping **"I've transferred this"** logs a **settlement** (a row in History →
  Transfers) and the balance drops accordingly. Settling, partial settling, and
  over-settling all work; an unsettled remainder just carries forward.

Core math: `computeMonthlySummary` (per-month total / share / paid-personally)
and `computeSettlementBalance` (the cumulative balance) in `lib/calc.ts`.

## Fixed costs (recurring monthly costs)

Recurring costs — rent, subscriptions, etc. — are stored as **templates** in the
`recurring_expenses` table and managed on the **Fixed costs** page (amount,
category, who pays, personal/joint).

They are **not** added automatically. From the **Monthly summary**, the
"Add this month's fixed costs" button materialises the active templates into the
selected month as normal `expenses` rows (dated the 1st). From then on they're
ordinary expenses you can edit or delete per month from **History**.

Seeding is idempotent: `seedMonth` skips any template that already has an expense
in that month (deduped against the actual `expenses` rows by `recurring_id`), so
the button never duplicates — and if you delete a fixed cost for a month you can
re-add it by clicking again. Server logic lives in `lib/recurring.ts` and
`app/actions/recurring.ts`. (The legacy `recurring_seeded` table is no longer
used.)

## Profiles (Netflix-style switcher)

On first visit you pick a profile (Daniel or Laura) on `/select`. The choice is
stored in a cookie (`profile_id`) and **remembered** — return visits go straight
to the dashboard. A "Switch" affordance returns to the picker.

This is a **profile switcher, not authentication**: either person can pick
either profile and both see the same data. It's a deliberate stepping stone —
when real auth is added later, the selected profile simply becomes the
logged-in user and these personalized views carry over.

The dashboard renders from the selected profile's perspective: **your** transfer
to the joint account is the headline figure, and your partner's is shown small /
de-emphasized. Selection logic: `lib/profile-session.ts` (cookie read) and
`app/actions/profile.ts` (`selectProfile` / `switchProfile`). The `Avatar`
component renders initials on a colored disc as a fallback when there's no photo.

> **Visuals hand-off (pending):** the picker styling, real profile photos, hiding
> the nav on `/select`, and moving `<ProfileSwitcher>` into the nav top-left are
> Visuals-agent tasks. See `CLAUDE.md` → Current state.

## Customizing the look & copy

- **`theme.ts`** — all colors, fonts, radii, spacing. Change a value and it
  updates everywhere (it feeds Tailwind via `tailwind.config.ts`).
- **`content.ts`** — all user-facing text + the currency/locale config.
- **`app/globals.css`** — base styles and the font `@import` (one line to swap
  the typeface).
- **`public/images/`** — named image slots (`logo.png`, `hero.jpg`,
  `background.jpg`). Replace a file to change the image; no code change needed.

---

## 1. Set up the database (Neon)

1. Create a project at [neon.tech](https://neon.tech) (free tier is fine).
2. In Neon's **SQL Editor**, paste and run [`neon-schema.sql`](./neon-schema.sql).
   This creates the tables and indexes (no seed data, no RLS — access is gated by
   the server-side connection string).
3. Seed the two people into `profiles` (and any starter categories / fixed costs),
   e.g.:
   ```sql
   insert into profiles (display_name) values ('Daniel'), ('Laura');
   update profiles a set partner_id = b.id from profiles b where a.id <> b.id;
   ```
4. Grab the **pooled** connection string from Neon's dashboard for the next step.

> The legacy `supabase-*.sql` files remain in the repo only as history from the
> original Supabase setup — they are no longer used.

## 2. Run locally

1. Put your Neon connection string in `.env.local`:
   ```
   DATABASE_URL=postgresql://USER:PASSWORD@ep-...-pooler.REGION.aws.neon.tech/DB?sslmode=require
   ```
2. Install and start:
   ```bash
   npm install
   npm run dev
   ```
3. Open http://localhost:3000 — first visit shows the profile picker; after you
   pick a profile it's remembered and you land on the dashboard.

## 3. Deploy to Vercel (GitHub-managed)

Deployment is wired to GitHub: **every push to `main` auto-deploys** — no CLI
needed.

First-time setup:

1. At [vercel.com/new](https://vercel.com/new), signed into the Vercel account
   connected to your GitHub, **import** the repo. It auto-detects Next.js.
   - If the repo isn't listed, use **Adjust GitHub App Permissions** to grant
     Vercel access to it.
2. Under **Environment Variables**, add **`DATABASE_URL`** (your Neon connection
   string) for **all environments** (Production, Preview, Development). It's
   required at runtime; the build itself doesn't need it (the Neon client is
   created lazily, and all pages are `force-dynamic`).
3. **Deploy.** Confirm **Settings → Git → Production Branch** is `main`.

After that, the workflow is just: push to `main` → Vercel builds and deploys. To
point at a different Neon database, edit `DATABASE_URL` in **Settings →
Environment Variables** and redeploy.

## Pages

| Route                 | What it does                                                        |
| --------------------- | ------------------------------------------------------------------- |
| `/`                   | Redirects to `/dashboard` (remembered profile) or `/select`         |
| `/select`             | Profile picker (Netflix-style); sets the `profile_id` cookie        |
| `/dashboard`          | Monthly summary from the selected profile's view + "add fixed costs" |
| `/expenses`           | Log a new expense                                                   |
| `/expenses/history`   | Month filter, page size (10/25/50), inline edit, multi-select bulk delete |
| `/fixed-costs`        | Manage recurring monthly costs (amount, category, payer, source)    |
| `/expense-types`      | Manage categories (add / rename / delete)                           |
