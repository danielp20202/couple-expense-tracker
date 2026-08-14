"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { content } from "@/content";
import { clsx } from "@/lib/clsx";

const links = [
  { href: "/dashboard", label: content.nav.dashboard },
  { href: "/chores", label: content.nav.chores },
  { href: "/expenses", label: content.nav.addExpense },
  { href: "/expenses/history", label: content.nav.history },
  { href: "/activities", label: content.nav.activities },
  { href: "/fixed-costs", label: content.nav.fixedCosts },
  { href: "/expense-types", label: content.nav.types },
];

export function Nav() {
  const pathname = usePathname();
  if (pathname === "/select") return null;
  return (
    <nav className="bg-background border-b border-border">
      <div className="mx-auto max-w-3xl px-page">
        <div className="flex items-center justify-between py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 font-serif font-semibold text-ink tracking-tight"
          >
            <img src="/images/laura_1.webp" alt="" className="h-7 w-7 rounded-full object-cover ring-1 ring-border" />
            {content.appName}
          </Link>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-0 -mb-px">
          {links.map((l) => {
            // Chores has sub-routes (/chores/manage) that should keep the tab active.
            const active =
              pathname === l.href ||
              (l.href === "/chores" && pathname.startsWith("/chores/"));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  "whitespace-nowrap font-mono text-[11px] uppercase tracking-wide transition-colors min-h-[40px] flex items-center border-b-2 -mb-px",
                  active
                    ? "border-ink text-ink font-medium"
                    : "border-transparent text-ink-muted hover:text-ink"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
