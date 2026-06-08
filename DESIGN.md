# Design System — Couple Expense Tracker

This document is the single source of truth for all visual and UX decisions.
Any agent making UI changes must read this first, implement against it, and
verify changes meet the metrics defined here before committing.

---

## 1. Design principles

| Principle | What it means in practice |
|-----------|--------------------------|
| **Light** | Generous white space. Never fill a surface just because there's room. |
| **Readable at a glance** | The most important number on any screen should be legible in under 2 seconds without scanning. |
| **Warm but minimal** | The palette suggests closeness without being cluttered or cutesy. |
| **One task per screen** | Each page has one primary action. Everything else is secondary or hidden until needed. |
| **No visual noise** | Borders, dividers, and shadows exist only when they aid separation — not as decoration. |

---

## 2. Color palette

Update these values in `theme.ts`. Tailwind picks them up automatically.

### Base surfaces
| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#FAF9F7` | Page background — warm off-white, never pure white |
| `surface` | `#FFFFFF` | Cards and modals |
| `surface-muted` | `#F3F1EE` | Subtle hover states, secondary areas |
| `border` | `#E8E4DF` | Dividers and card outlines — barely visible |

### Ink (text)
| Token | Hex | Usage |
|-------|-----|-------|
| `ink` | `#1C1917` | Primary text — warm near-black, not pure black |
| `ink-muted` | `#78716C` | Labels, secondary text, timestamps |
| `ink-inverse` | `#FFFFFF` | Text on dark/colored backgrounds |

### Brand
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#C2674A` | Primary CTA buttons, active nav pill — warm terracotta |
| `primary-hover` | `#A8553A` | Hover state for primary |
| `accent` | `#7C9885` | Positive amounts, success states — muted sage green |

### Status
| Token | Hex | Usage |
|-------|-----|-------|
| `positive` | `#7C9885` | Money in, settled, all-clear states |
| `negative` | `#C2674A` | Errors, delete actions (reuse primary — warm red-orange) |
| `warning-bg` | `#FDF3E7` | Warning banners background |

### Hero gradient (layout.tsx)
```
linear-gradient(135deg, #3D2314 0%, #C2674A 60%, #E8956D 100%)
```
Warm deep brown → terracotta → soft peach. Replaces the current blue.

---

## 3. Typography

Set in `theme.ts` and `app/globals.css`.

| Role | Font | Weight | Size |
|------|------|--------|------|
| Body / UI | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) | 400, 500, 600 | — |
| Monospace (amounts) | [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | 500 | — |

### Type scale (Tailwind classes)
| Use | Class | Notes |
|-----|-------|-------|
| Hero tagline | `text-2xl font-semibold` | One per page max |
| Section title | `text-base font-semibold` | |
| Body / row label | `text-sm` | Default for all list content |
| Secondary / meta | `text-xs text-ink-muted` | Dates, sub-labels |
| Money — primary | `text-2xl font-semibold font-mono` | The main figure on a card |
| Money — inline | `text-sm font-mono` | Inside lists |

### Rules
- Line height: use Tailwind's default `leading-normal` (1.5). Never tighten text.
- Never use more than 3 type sizes on a single screen.
- Labels for form fields: `text-sm font-medium text-ink-muted`, always above the input.

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
| Cards | `rounded-2xl` (16px) | `shadow-sm` — subtle, warm: `0 1px 3px rgba(28,25,23,0.08)` |
| Buttons (primary) | `rounded-full` | None |
| Buttons (ghost/danger) | `rounded-full` | None |
| Inputs | `rounded-xl` (12px) | None — rely on border |
| Nav pills | `rounded-full` | None |
| Avatar / logo image | `rounded-full` | None |

**Rule:** No hard right angles anywhere in the UI. Everything has at least `rounded-xl`.

---

## 6. Components

### Cards
- Background: `bg-surface`
- Border: `border border-border` (1px, warm light grey)
- Shadow: `shadow-sm`
- Padding: `p-5`
- Radius: `rounded-2xl`
- Never nest a card inside a card.

### Buttons
```
Primary:  bg-primary text-ink-inverse rounded-full px-5 py-2 text-sm font-medium
Ghost:    text-ink-muted hover:bg-surface-muted rounded-full px-3 py-1.5 text-sm
Danger:   text-negative hover:bg-surface-muted rounded-full px-3 py-1.5 text-sm
```
- Minimum tap target: 40px tall.
- Disabled state: `opacity-40 cursor-not-allowed`.
- Never show more than one primary button per view.

### Inputs
```
border border-border rounded-xl px-3 py-2 text-sm bg-surface
focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
```

### Money display
- Always use the mono font for amounts: `font-mono`.
- Positive amounts: `text-positive`.
- Negative / owed amounts: `text-negative`.
- Always show currency symbol. Use the `formatMoney()` util — never format inline.

### Nav
- Background: `bg-surface border-b border-border`
- Active pill: `bg-primary text-ink-inverse`
- Inactive: `text-ink-muted hover:bg-surface-muted`
- Logo: circular avatar (`rounded-full`), 24×24px

### Hero banner
- Height: `h-32` (128px) — no taller.
- Use the warm gradient defined in §2 unless a real photo is available.
- Overlay: `bg-black/25` when a photo is used, to ensure text contrast.
- Text: page title (`text-xs uppercase tracking-widest text-white/70`) + tagline (`text-xl font-semibold text-white`).

---

## 7. Layout rules

- Max content width: `max-w-3xl` (768px). Never go wider.
- Single-column layout on all pages. No sidebars.
- Page structure: Hero → Page title (as `<SectionTitle>`) → Cards top to bottom.
- The most important information (the big number) goes at the top of its card, full width.
- Destructive actions (delete) are always the last item, visually separated or ghost-styled.

---

## 8. UX rules

- **Empty states** must have a short friendly message and, where relevant, a single CTA. Never just blank space.
- **Loading / pending** states: disable the triggering button with `opacity-40`. No spinners unless an action takes >1s.
- **Error messages**: inline below the relevant field or at the top of the card in `text-negative text-sm`. Never an alert/modal for a field error.
- **Confirmation dialogs**: only for destructive actions. Use the native `confirm()` — no custom modals.
- **Forms**: one primary action button, right-aligned or full-width. Cancel is ghost, always to the left of the primary.

---

## 9. Measurable checks (run these before committing any UI change)

An agent must verify all of the following by taking a screenshot and inspecting the result:

| # | Check | Pass criteria |
|---|-------|---------------|
| 1 | **Contrast** | All body text passes WCAG AA (4.5:1 ratio minimum). Use `text-ink` on `background` or `surface`. |
| 2 | **Touch targets** | Every interactive element is at least 40px tall. |
| 3 | **Type count** | No more than 3 distinct font sizes visible on a single screen. |
| 4 | **Primary actions** | No more than 1 primary (filled) button visible per screen. |
| 5 | **Spacing** | No two cards or sections are touching (always `space-y-5` between them). |
| 6 | **Right angles** | No element has `rounded-none` or `rounded` (too subtle) — minimum `rounded-xl`. |
| 7 | **Token usage** | No hardcoded hex colors in component files — all colors use Tailwind semantic tokens from `theme.ts`. |
| 8 | **Money font** | All currency amounts rendered with `font-mono`. |
| 9 | **Background** | Page background is `bg-background` (`#FAF9F7`), not white. |
| 10 | **Noise** | No decorative borders or shadows beyond what's defined in §5. |

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

All other files are owned by the app agent. If a visual change requires editing
a component outside the above list (e.g. a card inside a page), coordinate with
the app agent rather than editing directly.
