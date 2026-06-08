# Couple Expense Tracker

A small Next.js (App Router) + Supabase web app for a couple sharing expenses
50/50. It tracks every shared expense — whether paid from a personal card or the
joint account — and each month tells each person how much to move into the joint
account so you've both covered an equal half.

> **Note on auth:** this version has **no login** (per the build brief). The two
> people are seeded directly into the database and linked via `partner_id`. The
> app uses Supabase's public anon key with permissive row-level security. That's
> fine for a private, unadvertised deployment, but see the bottom of
> `supabase-setup.sql` for how to lock it down when you add real auth.

> **Working on this project?** Two agents collaborate here (an App agent and a
> Visuals agent). Read [`CLAUDE.md`](./CLAUDE.md) for file ownership and the
> branching rules before making changes.

## How the split works

- Every expense is 50/50, so each person's fair share = monthly total ÷ 2.
- Money you paid **personally** counts toward your half.
- Money paid from the **joint account** is funded by both of you, so it isn't
  credited to either person individually.
- Each person's transfer into the joint account = `fair share − what they paid
  personally`. If someone overpaid their half, their transfer shows as $0 and the
  other person covers the joint shortfall.

Logic lives in `lib/calc.ts`. (It also computes a direct person-to-person
settlement for the overpay case; that section is currently hidden on the
dashboard but the math is intact if you want to re-add it.)

## Fixed costs (recurring monthly costs)

Recurring costs — rent, subscriptions, etc. — are stored as **templates** in the
`recurring_expenses` table and managed on the **Fixed costs** page (amount,
category, who pays, personal/joint).

They are **not** added automatically. From the **Monthly summary**, the
"Add this month's fixed costs" button materialises the active templates into the
selected month as normal `expenses` rows (dated the 1st). From then on they're
ordinary expenses you can edit or delete per month from **History**.

Seeding is idempotent and resurrection-safe: each `(template, month)` pair is
recorded in `recurring_seeded`, so a fixed cost lands in a given month at most
once — deleting a copy won't make it silently reappear. Server logic lives in
`lib/recurring.ts` and `app/actions/recurring.ts`.

## Profiles (Netflix-style switcher)

On first visit you pick a profile (Daniel or Laura) on `/select`. The choice is
stored in a cookie (`profile_id`) and **remembered** — return visits go straight
to the dashboard. A "Switch" affordance returns to the picker.

This is a **profile switcher, not authentication**: either person can pick
either profile and both see the same data. It's a deliberate stepping stone —
when real Supabase auth is added later, the selected profile simply becomes the
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

## 1. Set up the database (Supabase)

1. In your Supabase project, open **SQL Editor → New query**.
2. Paste the contents of [`supabase-setup.sql`](./supabase-setup.sql).
3. Edit the **SEED** section — put your and your partner's real names.
4. Run it. This creates the tables, RLS policies, the two linked profiles, and a
   starter set of categories.
5. Then run [`supabase-migration-fixed-costs.sql`](./supabase-migration-fixed-costs.sql)
   the same way. It adds the fixed-costs tables (`recurring_expenses`,
   `recurring_seeded`) and the `expenses.recurring_id` column, trims the category
   list, and — for this deployment — renames the seeded partner and seeds the
   initial fixed costs. Every statement is guarded, so it's safe to re-run; edit
   the seed values near the bottom for a different setup.

## 2. Run locally

1. Copy the env template and fill in your Supabase values (Project Settings →
   API):
   ```bash
   cp .env.local.example .env.local
   ```
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```
2. Install and start:
   ```bash
   npm install
   npm run dev
   ```
3. Open http://localhost:3000 — it redirects to the monthly summary.

## 3. Deploy to Vercel + connect Supabase

1. Push this project to a Git repo (GitHub/GitLab/Bitbucket).
2. In Vercel: **Add New → Project**, import the repo. It auto-detects Next.js.
3. Under **Environment Variables**, add the same two vars from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Your existing Supabase project is "connected" simply by pointing
   these env vars at it — no extra integration step is required for this app.
5. (Optional) Use Vercel's official Supabase integration
   (Vercel → Integrations → Supabase) to sync these env vars automatically.

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
