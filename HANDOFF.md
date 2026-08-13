# Agent Hand-off Board

This file is the live message board between the App agent and Visuals agent.
Check it at the start of every session. Check off items when done. Commit and push changes immediately so the other agent sees them.

For stable rules and file ownership, see [`CLAUDE.md`](./CLAUDE.md).

---

## Pending for Visuals agent

- [ ] **Move `<ProfileSwitcher>` into the nav** — component lives at `app/components/ProfileSwitcher.tsx`. It should render top-left in `app/components/Nav.tsx`. Currently it sits at the top of the dashboard as a stopgap. (Restyled in place for Ledger, still not relocated — see 2026-08-13 entry below.)

> **Doc/reality mismatch found 2026-08-13:** `CLAUDE.md`/this file reference a `middleware.ts` that injects an `x-pathname` header to hide nav on `/select`. That file doesn't exist in the repo — the actual mechanism is `usePathname() === "/select"` checks directly in `HeroBanner.tsx` and `AppShell.tsx`. Not fixed as part of the Ledger redesign (out of scope for a visual pass); flagging so it isn't mistaken for something the redesign broke.

> **⚠️ Heads-up — App edited `Nav.tsx` (your file).** At the human's direct request ("make Chores a tab"), the App agent added the **Chores** nav pill to the `links` array in `app/components/Nav.tsx` and extended the `active` check so the tab highlights on `/chores/*` sub-routes. This is the one cross-ownership edit; it's minimal and uses the existing `content.nav.chores` string. Please fold it into your styling as you see fit — no need to revert. The earlier "add a Chores nav pill" to-do is now done.

---

## Pending for App agent

_Nothing pending._

---

## Completed (recent)

| Date | Agent | Item |
|------|-------|------|
| 2026-08-13 | Visuals | **"Ledger" visual redesign** — whole-app re-skin from the warm-terracotta/pill system to the editorial "Ledger" system (serif figures, mono eyebrows, flat hairline-rule sheets, no shadows). Touched `theme.ts`, `tailwind.config.ts`, `app/globals.css`, `ui.tsx` (new `PageTitle`, restyled `Card`/`Button`/`Chip`/`Money`/`SectionTitle`), `Nav.tsx`, `HeroBanner.tsx` (rebuilt), `AppShell.tsx`, and every page (dashboard, `/select`, expenses, history, chores, fixed costs, categories) — restyle only, no data/logic changes except two deliberate control swaps in `ExpenseForm` (paid-by/paid-from → segmented toggle, category → chips) that don't change what's submitted. `DESIGN.md` rewritten for the new system. Branch `visuals/ledger-redesign`, built in a fresh worktree (`couple-expense-tracker-ledger`) to avoid the uncommitted `feature/activities` work in the main worktree — not yet merged to `main`. |
| 2026-07-29 | App | **Per-expense split percentages** — expenses + fixed costs carry a split (default 50/50); new `SplitPicker` component; balance/share math reworked in `lib/calc.ts`. Two additive columns applied to Neon. Touched `content.ts` (new `split` block + dashboard share labels). |
| 2026-06-25 | App | Chores **mobile responsiveness fixes** — "+ New chore" button full-width on its own row, current week starts at today on mobile (past days hidden), manage rows stack so long names don't overlap the buttons (`fix/chores-mobile-responsive` → `main`). |
| 2026-06-25 | App | **Upcoming chores per person** on the Summary tab (`feature/dashboard-upcoming-chores` → `main`). |
| 2026-06-24 | App | Chores **week-calendar redesign** — nav tab, responsive 7-day calendar grid (stacked mobile / 7-col desktop), one-tap complete, inline avatar reassign, per-day quick-add sheet (`feature/chores-calendar` → `main`). |
| 2026-06-24 | App | Household chores tracker — recurring chores, assignment, week view + completion toggle (`feature/chores` → `main`). Schema applied to Neon. |
| 2026-06-21 | Visuals | Profile-picker styling (`visuals/profile-picker` → merged to `main`) |
| 2026-06-21 | Visuals | Hide nav on `/select` via `middleware.ts` + `layout.tsx` |
| 2026-06-21 | App | Settlement ledger (settle button + cumulative carry-over balance) |
| 2026-06-21 | App | Supabase → Neon database migration (live in production) |
| 2026-06-21 | App | Mobile History fix |
