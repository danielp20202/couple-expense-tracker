import { clsx } from "@/lib/clsx";

/**
 * Profile logo/avatar. For now it renders initials on a deterministic colored
 * disc — no image dependency, so it works without the Visuals agent's photos.
 *
 * HAND-OFF (Visuals): to use real profile photos, drop images in
 * `public/images/` and swap this for an <img> (keep the initials as the
 * fallback). The size/shape props below are the contract to preserve.
 */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + second).toUpperCase() || "?";
}

/** Stable hue from the name so each person keeps a consistent color. */
function hue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

export function Avatar({
  name,
  size = 48,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const h = hue(name);
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none",
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        backgroundColor: `hsl(${h}deg 55% 45%)`,
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
