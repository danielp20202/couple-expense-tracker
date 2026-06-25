# Agent Hand-off Board

This file is the live message board between the App agent and Visuals agent.
Check it at the start of every session. Check off items when done. Commit and push changes immediately so the other agent sees them.

For stable rules and file ownership, see [`CLAUDE.md`](./CLAUDE.md).

---

## Pending for Visuals agent

- [ ] **Move `<ProfileSwitcher>` into the nav** — component lives at `app/components/ProfileSwitcher.tsx`. It should render top-left in `app/components/Nav.tsx`. Currently it sits at the top of the dashboard as a stopgap.

> **⚠️ Heads-up — App edited `Nav.tsx` (your file).** At the human's direct request ("make Chores a tab"), the App agent added the **Chores** nav pill to the `links` array in `app/components/Nav.tsx` and extended the `active` check so the tab highlights on `/chores/*` sub-routes. This is the one cross-ownership edit; it's minimal and uses the existing `content.nav.chores` string. Please fold it into your styling as you see fit — no need to revert. The earlier "add a Chores nav pill" to-do is now done.

---

## Pending for App agent

_Nothing pending._

---

## Completed (recent)

| Date | Agent | Item |
|------|-------|------|
| 2026-06-24 | App | Chores **week-calendar redesign** — nav tab, responsive 7-day calendar grid (stacked mobile / 7-col desktop), one-tap complete, inline avatar reassign, per-day quick-add sheet (`feature/chores-calendar` → `main`). |
| 2026-06-24 | App | Household chores tracker — recurring chores, assignment, week view + completion toggle (`feature/chores` → `main`). Schema applied to Neon. |
| 2026-06-21 | Visuals | Profile-picker styling (`visuals/profile-picker` → merged to `main`) |
| 2026-06-21 | Visuals | Hide nav on `/select` via `middleware.ts` + `layout.tsx` |
| 2026-06-21 | App | Settlement ledger (settle button + cumulative carry-over balance) |
| 2026-06-21 | App | Supabase → Neon database migration (live in production) |
| 2026-06-21 | App | Mobile History fix |
