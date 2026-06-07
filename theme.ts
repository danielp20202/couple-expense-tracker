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
    background: "#f6f7fb", // app page background
    surface: "#ffffff", // cards / panels
    surfaceMuted: "#f0f2f8", // subtle filled areas, table header rows
    border: "#e3e6ef", // hairline borders

    // Text
    ink: "#1c2330", // primary text
    inkMuted: "#6b7280", // secondary / helper text
    inkInverse: "#ffffff", // text on colored backgrounds

    // Brand / actions
    primary: "#4f46e5", // main brand color (buttons, links, active state)
    primaryHover: "#4338ca", // hover state for primary
    accent: "#0ea5e9", // secondary highlight

    // Status
    positive: "#16a34a", // money coming back to you / settled / good
    negative: "#dc2626", // money you owe / destructive actions
    warningBg: "#fef3c7", // soft callout background
  },

  // Font family names. Import the actual webfont in app/globals.css.
  fonts: {
    sans: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },

  // Corner roundness
  radius: {
    card: "16px",
    control: "10px", // buttons, inputs
    pill: "9999px",
  },

  // A few custom spacing tokens (Tailwind's default scale still works too)
  spacing: {
    page: "1.25rem", // outer page padding on mobile
  },
} as const;

export type Theme = typeof theme;
