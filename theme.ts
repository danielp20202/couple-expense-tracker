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
 * ========================================================================== */

export const theme = {
  colors: {
    // Page + surfaces
    background: "#FAF9F7", // warm off-white page background
    surface: "#FFFFFF", // cards / panels
    surfaceMuted: "#F3F1EE", // subtle hover states, secondary areas
    border: "#E8E4DF", // hairline borders — barely visible

    // Text
    ink: "#1C1917", // primary text — warm near-black
    inkMuted: "#78716C", // secondary / helper text
    inkInverse: "#FFFFFF", // text on colored backgrounds

    // Brand / actions
    primary: "#C2674A", // warm terracotta — buttons, active nav
    primaryHover: "#A8553A", // hover state for primary
    accent: "#7C9885", // muted sage green

    // Status
    positive: "#7C9885", // settled / all-clear — sage green
    negative: "#C2674A", // errors / destructive — reuse primary
    warningBg: "#FDF3E7", // soft warm warning background
  },

  // Font family names. Import the actual webfont in app/globals.css.
  fonts: {
    sans: "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },

  // Corner roundness
  radius: {
    card: "16px",
    control: "12px", // inputs and form controls
    pill: "9999px",  // buttons and nav pills
  },

  // A few custom spacing tokens (Tailwind's default scale still works too)
  spacing: {
    page: "1.25rem", // outer page padding on mobile
  },
} as const;

export type Theme = typeof theme;
