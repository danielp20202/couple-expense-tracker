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

## Current state

- `main` is the stable branch; both agents merge and push here.
- App agent last merged: fixed costs, history revamp (filters + bulk delete), and the **profile landing** (Netflix-style `/select` picker + per-profile personalized dashboard).
- Visuals agent last merged: design system (warm palette, Plus Jakarta Sans, pill buttons, type scale).

### Open hand-off → Visuals agent (from the profile landing feature)

The App agent built the functional plumbing with placeholders. These visual pieces are yours:

1. **Profile photos.** Drop images into `public/images/` and swap the internals of `app/components/Avatar.tsx` to render them — keep the initials as the fallback (preserve the `size`/shape contract).
2. **Picker styling.** Style the `/select` page (`app/select/page.tsx`) into proper Netflix-style tiles.
3. **Hide the nav on `/select`.** Currently the normal nav renders there; suppress it in `app/layout.tsx`.
4. **Move the switcher into the nav.** `app/components/ProfileSwitcher.tsx` is a self-contained `<Link>`; relocate it to the top-left of `Nav.tsx` (it's currently rendered at the top of the dashboard).
