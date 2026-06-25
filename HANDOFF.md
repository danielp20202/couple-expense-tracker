# Agent Hand-off Board

This file is the live message board between the App agent and Visuals agent.
Check it at the start of every session. Check off items when done. Commit and push changes immediately so the other agent sees them.

For stable rules and file ownership, see [`CLAUDE.md`](./CLAUDE.md).

---

## Pending for Visuals agent

- [ ] **Move `<ProfileSwitcher>` into the nav** — component lives at `app/components/ProfileSwitcher.tsx`. It should render top-left in `app/components/Nav.tsx`. Currently it sits at the top of the dashboard as a stopgap.
- [ ] **Add a "Chores" nav pill** — the App agent shipped a Chores section (`/chores` week view + `/chores/manage`). It's reachable from a card on the dashboard as a stopgap, but it should get its own nav pill in `app/components/Nav.tsx`. The copy string is already in `content.ts` as `content.nav.chores` ("Chores") — just add `{ href: "/chores", label: content.nav.chores }` to the `links` array. No new strings needed from you.

---

## Pending for App agent

- [ ] **Apply the chores schema to Neon, then verify + merge** — `feature/chores` adds two tables (`chores`, `chore_completions`, see `neon-schema.sql`). They must be created in the Neon DB **before** merging to `main` (main auto-deploys; `/chores` 500s without the tables). After applying: run the dev server, create a couple of chores, toggle completions, then merge.

---

## Completed (recent)

| Date | Agent | Item |
|------|-------|------|
| 2026-06-21 | Visuals | Profile-picker styling (`visuals/profile-picker` → merged to `main`) |
| 2026-06-21 | Visuals | Hide nav on `/select` via `middleware.ts` + `layout.tsx` |
| 2026-06-21 | App | Settlement ledger (settle button + cumulative carry-over balance) |
| 2026-06-21 | App | Supabase → Neon database migration (live in production) |
| 2026-06-21 | App | Mobile History fix |
