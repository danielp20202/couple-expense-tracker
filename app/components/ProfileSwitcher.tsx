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
      className="inline-flex items-center gap-2 rounded-pill bg-surface-muted px-2 py-1 text-sm text-ink hover:bg-border transition-colors"
      title={content.profiles.switch}
    >
      <Avatar name={name} size={28} photoSrc={content.profiles.photos[name]} />
      <span className="font-medium">{name}</span>
      <span className="text-ink-muted text-xs">{content.profiles.switch}</span>
    </Link>
  );
}
