# Design System — Couple Expense Tracker ("Ledger")

This document is the single source of truth for all visual and UX decisions.
Any agent making UI changes must read this first, implement against it, and
verify changes meet the metrics defined here before committing.

This is the second visual direction the app has shipped ("Ledger"), replacing
the earlier warm-terracotta pill/card system. It's an editorial, data-forward
look: serif ledger figures, hairline rules, flat sheets, right-aligned
tabular numbers, mono uppercase labels — instead of card-and-pill fintech UI.

---

## 1. Design principles

| Principle | What it means in practice |
|-----------|--------------------------|
| **Editorial, not fintech** | Amounts read like ledger entries — serif figures, hairline rules — not pills and gradient cards. |
| **One number leads** | The balance is the single biggest figure on the dashboard. Everything else is secondary. |
| **Flat, not soft** | No shadows. Separation comes from a hairline border or a divider, never a shadow or heavy roundness. |
| **Direction is never color-only** | "You owe" / "owed to you" always pairs a color with an icon + label — never color alone (accessibility). |
| **One task per screen** | Each page has one primary action. Everything else is secondary or hidden until needed. |

---

## 2. Color palette

Update these values in `theme.ts`. Tailwind picks them up automatically.

### Base surfaces
| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#EAE7DF` | Page background — warm parchment |
| `surface` | `#F6F3EC` | Cards and modals — a flat sheet, not white |
| `surface-muted` | `#EFEBE0` | Subtle hover states, secondary areas, "row in edit" |
| `border` | `#DDD6C8` | Hairline borders — visible, not barely-there |

### Ink (text)
| Token | Hex | Usage |
|-------|-----|-------|
| `ink` | `#1E1C18` | Primary text — near-black ink |
| `ink-muted` | `#8C8676` | Labels, secondary text, timestamps |
| `ink-inverse` | `#F6F3EC` | Text on ink-colored backgrounds |

### Brand
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#1E1C18` | Primary CTA buttons, active nav — ink, not a brand hue |
| `primary-hover` | `#3D3A32` | Hover state for primary |
| `accent` | `#2F6B4F` | Forest green — positive amounts, active accents |

### Status
| Token | Hex | Usage |
|-------|-----|-------|
| `positive` | `#2F6B4F` | Owed to you, settled, all-clear — forest green |
| `negative` | `#6B3F63` | You owe, destructive actions — plum |
| `warning-bg` | `#F3E9DC` | Warning banners background |

No hero gradient — the masthead (`HeroBanner.tsx`) is flat `bg-background`,
no image or gradient.

---

## 3. Typography

Set in `theme.ts` and `app/globals.css`. Three families, each with a
distinct job — don't mix their roles.

| Role | Font | Used for |
|------|------|----------|
| Headings + money | [Source Serif 4](https://fonts.google.com/specimen/Source+Serif+4) | Page titles (`PageTitle`), the dashboard balance figure, every dollar amount (`Money`) |
| Body / UI | [Inter](https://fonts.google.com/specimen/Inter) | Paragraphs, form labels, buttons, general copy |
| Mono / eyebrows | [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) | Uppercase eyebrow labels (`SectionTitle`), nav tabs, dates, day/month calendar numerals, chips |

### Type scale
| Use | Class | Notes |
|-----|-------|-------|
| Page title | `PageTitle` component | `font-serif text-[21px] font-semibold` — one per page |
| Balance / headline figure | `Money` + `text-[40px] font-semibold` | The one big number on the dashboard |
| Section eyebrow | `SectionTitle` component | `font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted` |
| Body / row label | `text-sm` | Default for list content |
| Secondary / meta | `text-xs text-ink-muted` | Dates, sub-labels |
| Money — inline | `Money` component | Always `font-serif tabular-nums` regardless of size |

### Rules
- **All money renders through the `Money` component** — serif, tabular
  numerals, optional `tone` (`positive`/`negative`/`default`). Never format
  a dollar amount inline with a different font.
- **All page-level titles use `PageTitle`**, not `SectionTitle` — the two
  are not interchangeable. `SectionTitle` is the small mono eyebrow used for
  card/section headings; `PageTitle` is the one large serif heading per page.
- Dates, calendar day numbers, nav tabs, and chip labels are mono.
- Never use more than 3 type sizes on a single screen.

---

## 4. Spacing

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `page` | `1.25rem` | `px-page` | Horizontal page padding |
| Card padding | `1.25rem` | `p-5` | Internal card padding |
| Section gap | `1.25rem` | `space-y-5` | Between cards on a page |
| Row gap | `0.75rem` | `space-y-3` | Between items inside a card |
| Inline gap | `0.5rem` | `gap-2` | Between icon and label, etc. |

**Rule:** When in doubt, add space rather than remove it.

---

## 5. Shape and elevation

| Element | Border radius | Shadow |
|---------|--------------|--------|
| Cards | `rounded-card` (3px) | **None** — a flat sheet with a hairline border only |
| Buttons (all variants) | `rounded-pill` (6px — no longer a true pill) | None |
| Inputs | `rounded-control` (6px) | None — rely on border |
| Chips / toggles | `rounded-pill` (6px) | None |
| Avatar | `rounded-full` | None |

**Rule:** Flat, not soft. No shadows anywhere. Separation comes from the
`border` hairline or a `divide-y` divider, never elevation.

---

## 6. Components

### Cards (`Card`)
- Background: `bg-surface`, border: `border border-border` (1px hairline),
  radius: `rounded-card`, padding: `p-5`. **No shadow.**
- Never nest a card inside a card.

### The "flat divided list" pattern
The dominant list pattern app-wide (history, transfers, categories, fixed
costs, chores management): `<Card className="p-0 overflow-hidden">` wrapping
a `<ul className="divide-y divide-border">`. Each row is a ledger entry —
this is the single most-reused pattern in the app; new lists should follow it
rather than inventing a new shape.

### Ledger row (history-style rows)
A row = `[day/mon numeral block] [title + meta] [right-aligned serif amount]`.
The day numeral is mono (`font-mono text-[15px]`), the title is serif
(`font-serif font-semibold`), the amount is `Money` right-aligned.

### Buttons (`Button`)
```
Primary: bg-primary text-ink-inverse font-semibold
Ghost:   border border-border text-ink-muted font-medium hover:bg-surface-muted
Danger:  bg-surface text-negative border border-negative font-medium
```
- Minimum tap target: 40px tall.
- Never show more than one primary button per view.

### Chips (`Chip`)
Mono, uppercase, `11px`, bordered — filled ink when active. Renders as a
`<button>` when given `onClick` (category pickers, split presets, weekday
toggles), a plain `<span>` badge otherwise.

### Segmented toggle
A bordered 2-option button row (see `ExpenseForm`'s paid-by/paid-from) —
used in place of a `<select>` for a genuine binary choice. Active option is
filled ink.

### Inputs
```
border border-border rounded-control px-3 py-2 text-sm bg-surface
focus:outline-none focus:ring-2 focus:ring-primary/40
```

### Money display (`Money`)
- Always serif, tabular numerals: `font-serif tabular-nums`.
- `tone="positive"` (forest) / `tone="negative"` (plum) / default (ink).
- Direction is never color-alone — pair with a ▲/▼/✓ icon and a text label
  (see the dashboard balance card).

### Nav (`Nav.tsx`)
- Flat `bg-background border-b border-border`, no filled pill.
- Active tab: `font-mono uppercase` + `border-b-2 border-ink`. Inactive:
  muted, no border.

### Masthead (`HeroBanner.tsx`)
- Flat `bg-background`, no gradient/image. Mono uppercase app name eyebrow +
  serif tagline. Hidden on `/select` (preserve the `usePathname` guard).

---

## 7. Layout rules

- Max content width: `max-w-3xl` (768px). Single-column, no sidebars.
- Page structure: masthead → `PageTitle` → cards top to bottom.
- The most important figure (the balance) goes at the top of its card, full
  width, in serif at headline size.
- Destructive actions (delete) are always the last item, danger-styled.

---

## 8. UX rules

- **Empty states**: a short friendly message, no decorative illustration.
- **Loading / pending**: disable the triggering control with `opacity-40`.
  No spinners unless an action takes >1s.
- **Error messages**: inline, `text-negative text-sm`, below the relevant
  field or at the top of the card. Never a modal for a field error.
- **Confirmation dialogs**: only for destructive actions, native `confirm()`.
- **Forms**: one primary action button, full-width or right-aligned. Cancel
  is ghost, to the left of the primary.

---

## 9. Measurable checks (run these before committing any UI change)

An agent must verify all of the following by taking a screenshot and
inspecting the result:

| # | Check | Pass criteria |
|---|-------|---------------|
| 1 | **Contrast** | All body text passes WCAG AA (4.5:1). Watch `ink-inverse` on `primary` specifically — primary is now near-black, not a bright brand color. |
| 2 | **Touch targets** | Buttons and form controls are at least 40px tall. (Dense chip rows — categories, weekday toggles — are an intentional, documented exception.) |
| 3 | **Type count** | No more than 3 distinct font sizes visible on a single screen. |
| 4 | **Primary actions** | No more than 1 primary (filled) button visible per screen. |
| 5 | **No shadows** | No `shadow-*` class or arbitrary shadow value anywhere. Separation is a hairline border or divider only. |
| 6 | **Money font** | Every currency amount renders through `Money` (serif, tabular). |
| 7 | **Title hierarchy** | Exactly one `PageTitle` per page; card/section headings use `SectionTitle`, never the reverse. |
| 8 | **Token usage** | No hardcoded hex colors in component files — all colors use Tailwind semantic tokens from `theme.ts`. |
| 9 | **Background** | Page background is `bg-background` (`#EAE7DF`), not white. |
| 10 | **Direction never color-only** | Owe/owed states pair color with an icon + text label. |

---

## 10. What's in scope for the visuals agent

The visuals agent owns these files:

```
theme.ts
tailwind.config.ts
app/globals.css
app/layout.tsx
app/components/Nav.tsx
public/images/
```

All other files are owned by the app agent. If a visual change requires
editing a component outside the above list (e.g. a card inside a page),
coordinate with the app agent rather than editing directly.

**Note on the Ledger redesign (2026-08-13):** implementing Ledger required
touching page-level components and shared primitives (`ui.tsx`, page.tsx
files, list/form components) well beyond this ownership list — done as a
single deliberate, whole-app pass with the human's sign-off, not the normal
per-agent workflow. Day-to-day changes should still respect the ownership
split above; treat this note as an explained one-time exception, not a
precedent.
