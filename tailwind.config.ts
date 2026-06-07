import type { Config } from "tailwindcss";
import { theme } from "./theme";

/**
 * Tailwind reads its color/radius/font/spacing values straight from theme.ts,
 * so editing theme.ts is what actually changes the look of the app. Components
 * use the semantic class names defined here (bg-surface, text-ink, etc.).
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./content.ts",
  ],
  theme: {
    extend: {
      colors: {
        background: theme.colors.background,
        surface: theme.colors.surface,
        "surface-muted": theme.colors.surfaceMuted,
        border: theme.colors.border,
        ink: theme.colors.ink,
        "ink-muted": theme.colors.inkMuted,
        "ink-inverse": theme.colors.inkInverse,
        primary: theme.colors.primary,
        "primary-hover": theme.colors.primaryHover,
        accent: theme.colors.accent,
        positive: theme.colors.positive,
        negative: theme.colors.negative,
        "warning-bg": theme.colors.warningBg,
      },
      borderRadius: {
        card: theme.radius.card,
        control: theme.radius.control,
        pill: theme.radius.pill,
      },
      fontFamily: {
        sans: theme.fonts.sans.split(",").map((f) => f.trim()),
        mono: theme.fonts.mono.split(",").map((f) => f.trim()),
      },
      spacing: {
        page: theme.spacing.page,
      },
    },
  },
  plugins: [],
};

export default config;
