/* ============================================================================
 * theme.ts — THE ONE PLACE TO CHANGE HOW THE APP LOOKS
 * ----------------------------------------------------------------------------
 * WHAT TO CHANGE HERE:
 *   - colors  : every color used in the app (backgrounds, text, buttons, etc.)
 *   - fonts   : the font family names (the actual font is imported in
 *               app/globals.css — see the note there)
 *   - radius  : how rounded corners are (cards, buttons, inputs)
 *   - spacing : a few custom spacing sizes
 *
 * HOW IT WORKS:
 *   These values are fed into Tailwind in tailwind.config.ts. Components use
 *   semantic class names (e.g. `bg-surface`, `text-ink`, `rounded-card`,
 *   `bg-primary`) that map back to the values below. So changing a value here
 *   updates that color/size EVERYWHERE in the app — no need to touch components.
 *
 *   Example: change `primary` below from blue to green and every button,
 *   link, and highlight in the app turns green.
 *
 * "Ledger" design system — editorial, flat, hairline-rule surfaces instead
 * of rounded shadowed cards; serif figures instead of pill/fintech shapes.
 * ========================================================================== */

export const theme = {
  colors: {
    // Page + surfaces
    background: "#EAE7DF", // warm parchment page background
    surface: "#F6F3EC", // cards / panels — flat sheets, not white
    surfaceMuted: "#EFEBE0", // subtle hover states, secondary areas
    border: "#DDD6C8", // hairline borders — visible, not barely-there

    // Text
    ink: "#1E1C18", // primary text — near-black ink
    inkMuted: "#8C8676", // secondary / helper text
    inkInverse: "#F6F3EC", // text on ink-colored backgrounds

    // Brand / actions
    primary: "#1E1C18", // ink-colored primary buttons/active states
    primaryHover: "#3D3A32", // hover state for primary
    accent: "#2F6B4F", // forest green — positive amounts, active accents

    // Status
    positive: "#2F6B4F", // owed to you / settled — forest green
    negative: "#6B3F63", // you owe / destructive — plum
    warningBg: "#F3E9DC", // warm-neutral warning background
  },

  // Font family names. Import the actual webfont in app/globals.css.
  fonts: {
    serif: "'Source Serif 4', ui-serif, Georgia, serif", // headings + headline figures
    sans: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif", // body
    mono: "'IBM Plex Mono', ui-monospace, monospace", // eyebrow labels, inline figures
  },

  // Corner roundness — Ledger is flat, not pill-shaped.
  radius: {
    card: "3px",
    control: "6px", // inputs and form controls
    pill: "6px", // buttons and toggle chips — no longer a true pill
  },

  // A few custom spacing tokens (Tailwind's default scale still works too)
  spacing: {
    page: "1.25rem", // outer page padding on mobile
  },
} as const;

export type Theme = typeof theme;
