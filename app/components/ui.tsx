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
    <div
      className={clsx(
        "bg-surface border border-border rounded-card p-5 shadow-[0_2px_8px_rgba(28,25,23,0.06),0_1px_2px_rgba(28,25,23,0.04)]",
        className
      )}
    >
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
    primary: "bg-primary text-ink-inverse hover:bg-primary-hover",
    ghost: "border border-border text-ink-muted hover:bg-surface-muted",
    danger: "bg-surface text-negative border border-negative hover:bg-negative hover:text-ink-inverse",
  };
  return (
    <button
      className={clsx(
        "rounded-pill px-5 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[40px]",
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

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-3">{children}</h2>;
}

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
    <span className={clsx("font-mono tabular-nums", toneClass, className)}>
      {value}
    </span>
  );
}
