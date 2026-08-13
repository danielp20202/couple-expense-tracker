"use client";

import { usePathname } from "next/navigation";
import { content } from "@/content";

export function HeroBanner() {
  const pathname = usePathname();
  if (pathname === "/select") return null;
  return (
    <div className="w-full bg-background border-b border-border">
      <div className="mx-auto max-w-3xl w-full px-page py-6">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-ink-muted mb-2">
          {content.appName}
        </p>
        <p className="font-serif text-2xl font-semibold text-ink tracking-tight">
          {content.tagline}
        </p>
      </div>
    </div>
  );
}
