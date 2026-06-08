# Agent coordination

Two agents are currently active on this project. Read this before making any changes.

## Agent roles

| Agent | Owns | Branch prefix |
|-------|------|---------------|
| **Visuals agent** | UI appearance only — `theme.ts`, `app/layout.tsx`, `app/components/Nav.tsx`, `app/globals.css`, `public/images/`, `tailwind.config.ts` | `visuals/` |
| **App agent** | Everything else — features, logic, data, routes, actions, database | `feature/` or `fix/` |

## Rules

- **Never work directly on `main`.** Always branch, then merge when done.
- **Each agent merges its own branch.** Pull latest `main` before branching, and again before merging back.
- **Hands off the other agent's files.** If a change genuinely requires touching a file outside your ownership (e.g. adding a new copy string to `content.ts` for a visual element), coordinate first — leave a comment or note in your PR rather than editing silently.
- **Commit frequently and keep branches short-lived.** The longer a branch lives, the higher the conflict risk.
- **`content.ts` is shared** — both agents may need it. Whoever touches it should commit and merge quickly so the other agent isn't blocked.

## Current state

- `main` is the stable branch. The app agent has uncommitted work in the working tree — do not reset or discard it.
- Visuals agent last merged: hero banner + `laura_1.webp` nav logo.
