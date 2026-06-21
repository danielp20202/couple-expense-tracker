# Agent coordination

Two agents are currently active on this project. Read this before making any changes.

## Agent roles

| Agent | Owns | Branch prefix |
|-------|------|---------------|
| **Visuals agent** | UI appearance only — `theme.ts`, `app/layout.tsx`, `app/components/Nav.tsx`, `app/globals.css`, `public/images/`, `tailwind.config.ts` | `visuals/` |
| **App agent** | Everything else — features, logic, data, routes, actions, database | `feature/` or `fix/` |

## Rules

- **Never work directly on `main`.** Always branch, then merge when done.
- **Announce your branch.** Whenever you report changes (to the human, or in a hand-off), include a quick note of which branch you're on — so it's always clear who is working where.
- **Each agent merges its own branch.** Pull latest `main` before branching, and again before merging back.
- **Hands off the other agent's files.** If a change genuinely requires touching a file outside your ownership (e.g. adding a new copy string to `content.ts` for a visual element), coordinate first — leave a comment or note in your PR rather than editing silently.
- **Commit frequently and keep branches short-lived.** The longer a branch lives, the higher the conflict risk.
- **`content.ts` is shared** — both agents may need it. Whoever touches it should commit and merge quickly so the other agent isn't blocked.
- **Work in your own worktree** (see below) so a branch checkout never changes files under the other agent.

## Worktrees

Each agent has its own git worktree — separate directories sharing one `.git`, so each can be on a different branch simultaneously without colliding:

| Directory | Agent | Branch |
|-----------|-------|--------|
| `couple-expense-tracker` | Visuals | `visuals/*` |
| `couple-expense-tracker-app` | App | `main`, `feature/*`, `fix/*` |

Create with `git worktree add <path> <branch>`. Each worktree needs its own `npm install` and `.env.local` (both gitignored). Don't check out the same branch in two worktrees at once. Branches/commits/pushes are shared; merges to `main` appear in the other worktree after `git fetch`/checkout.

## Current state

- `main` is the stable branch; both agents merge and push here.
- **App agent** last merged: fixed costs, history revamp, profile landing, the **settlement ledger** (settle button + cumulative carry-over balance), the mobile History fix, and the **Supabase → Neon database migration** (now live in production).
- **Visuals agent** last merged: design system (warm palette, Plus Jakarta Sans, pill buttons, type scale), and the **profile-picker styling** — `visuals/profile-picker` is now **merged to `main`** and deployed.

### Profile-picker hand-off — status (merged to `main`)

From the profile landing hand-off:

1. ✅ **Profile photos.** `Avatar.tsx` accepts a `photoSrc` prop; falls back to the initials disc. `laura_1.webp` wired to Laura.
2. ✅ **Picker styling.** `/select` shows the `ld_2.JPG` couple photo above the profile tiles; cards use design-system tokens.
3. ✅ **Hide nav on `/select`.** Done via `middleware.ts` (`x-pathname` header) + conditional render in `app/layout.tsx`.
4. ⏳ **Move ProfileSwitcher into the nav.** Still pending — `app/components/ProfileSwitcher.tsx` renders at the top of the dashboard for now. Visuals agent to handle next session.

App agent has pulled this into the `couple-expense-tracker-app` worktree, verified the type-check and the integrated flow (local + production), and confirmed `middleware.ts` doesn't conflict with the profile routing.

### Database migration → Neon — ✅ DONE (App agent)

The Supabase → Neon migration (original hand-off: Supabase's free tier pauses after 7 days; Neon's doesn't) is **complete and live in production**:

- All queries rewritten from the Supabase query-builder to **raw parameterized SQL** via the Neon serverless driver — `lib/db.ts` (lazy client; `date`/`timestamp` returned as strings).
- Data migrated to Neon (IDs/links preserved); production **cut over and verified** on `couple-expense-tracker-two.vercel.app`.
- `@supabase/supabase-js` removed; `lib/supabase/*` and the one-off migration scripts deleted.
- `DATABASE_URL` (Neon) set in Vercel for all environments; the client is lazy so the **build doesn't require it**.
- The `supabase-*.sql` files remain only as historical reference (unused).

### Note for App agent

- `middleware.ts` (created by Visuals agent) — don't remove or modify the `x-pathname` header injection; it's needed for nav suppression on `/select`.
- `app/select/page.tsx` was touched for styling only (className changes, photo map). The `selectProfile` action and data fetching are untouched.
- The earlier `text-lg` type-size nit on the dashboard is moot — the App agent rewrote that card for the personalized view, so no stray size remains.
