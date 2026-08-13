/**
 * Small UI primitives. All colors/radii/spacing come from theme.ts via the
 * semantic Tailwind classes (bg-surface, text-ink, rounded-card, ...), so
 * restyling the app means editing theme.ts, not these components.
 */
import { clsx } from "@/lib/clsx";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("bg-surface border border-border rounded-card p-5", className)}>
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: {
  variant?: "primary" | "ghost" | "danger";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: "bg-primary text-ink-inverse font-semibold hover:bg-primary-hover",
    ghost: "border border-border text-ink-muted font-medium hover:bg-surface-muted hover:text-ink",
    danger: "bg-surface text-negative font-medium border border-negative hover:bg-negative hover:text-ink-inverse",
  };
  return (
    <button
      className={clsx(
        "rounded-pill px-5 py-2 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[40px]",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-ink mb-1">
      {children}
    </label>
  );
}

const fieldClasses =
  "w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={fieldClasses} {...props} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={fieldClasses} {...props} />;
}

/**
 * Ledger-style chip. Renders as a `<button>` (toggleable) when `onClick` is
 * given — category pickers, split presets, weekday/filter toggles — or a
 * plain `<span>` badge otherwise.
 */
export function Chip({
  children,
  active,
  onClick,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const classes = clsx(
    "inline-flex items-center gap-1 rounded-pill border px-3 py-2 font-mono text-[11px] uppercase tracking-wide transition-colors",
    active ? "border-ink bg-ink text-ink-inverse" : "border-border bg-transparent text-ink-muted",
    onClick && "cursor-pointer hover:border-ink/50",
    className
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {children}
      </button>
    );
  }
  return <span className={classes}>{children}</span>;
}

/** Small mono uppercase eyebrow label — card/section headings. */
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted mb-3">
      {children}
    </h2>
  );
}

/** Large serif heading — the one primary title per page. */
export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-serif text-[21px] font-semibold text-ink tracking-tight">
      {children}
    </h1>
  );
}

/** All money figures render in serif tabular numerals — a ledger convention. */
export function Money({
  value,
  className,
  tone,
}: {
  value: string;
  className?: string;
  tone?: "positive" | "negative" | "default";
}) {
  const toneClass =
    tone === "positive"
      ? "text-positive"
      : tone === "negative"
        ? "text-negative"
        : "text-ink";
  return (
    <span className={clsx("font-serif tabular-nums", toneClass, className)}>
      {value}
    </span>
  );
}
