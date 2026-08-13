import Link from "next/link";
import { content } from "@/content";
import { Avatar } from "@/app/components/Avatar";

/**
 * Shows the active profile and links to the picker to switch (Netflix-style).
 *
 * HAND-OFF (Visuals): this is currently rendered at the top of the dashboard.
 * The brief is for it to live in the top-left of the nav — please relocate it
 * into `Nav.tsx` (it's a self-contained Link, safe to move) and style to taste.
 */
export function ProfileSwitcher({ name }: { name: string }) {
  return (
    <Link
      href="/select"
      className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface pl-1 pr-3 py-1 hover:bg-surface-muted transition-colors"
      title={content.profiles.switch}
    >
      <Avatar name={name} size={28} photoSrc={content.profiles.photos[name]} />
      <span className="font-mono text-[10.5px] uppercase tracking-wide text-ink-muted">
        {content.profiles.switch}
      </span>
    </Link>
  );
}
