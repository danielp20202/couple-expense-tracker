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
- **App agent** last merged: fixed costs, history revamp (filters + bulk delete), profile landing (Netflix-style `/select` picker + per-profile personalized dashboard).
- **Visuals agent** last merged: design system (warm palette, Plus Jakarta Sans, pill buttons, type scale). Branch `visuals/profile-picker` is pushed but **not yet merged** — awaiting approval.

### Visuals agent — branch `visuals/profile-picker` (pending merge)

Completed from the profile landing hand-off:

1. ✅ **Profile photos.** `Avatar.tsx` now accepts a `photoSrc` prop; falls back to initials disc. `laura_1.webp` wired to Laura.
2. ✅ **Picker styling.** `/select` page has `ld_2.JPG` couple photo centred above profile tiles; cards use design system tokens.
3. ✅ **Hide nav on `/select`.** Done via `middleware.ts` (injects `x-pathname` header) + conditional render in `app/layout.tsx`.
4. ⏳ **Move ProfileSwitcher into the nav.** Not yet done — `app/components/ProfileSwitcher.tsx` still renders at the top of the dashboard. Visuals agent will handle in next session.

### Note for App agent

- `middleware.ts` is a new file (created by Visuals agent) — do not remove or modify the `x-pathname` header injection, it's needed for the nav suppression on `/select`.
- `app/select/page.tsx` was touched for styling only (className changes, photo map). The `selectProfile` action and data fetching are untouched.
- `text-lg font-semibold` on transfer amounts in `app/dashboard/page.tsx` adds a 4th type size — worth fixing to `font-semibold` only when you next touch that file.
