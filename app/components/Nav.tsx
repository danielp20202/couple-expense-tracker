"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { content } from "@/content";
import { clsx } from "@/lib/clsx";

const links = [
  { href: "/dashboard", label: content.nav.dashboard },
  { href: "/expenses", label: content.nav.addExpense },
  { href: "/expenses/history", label: content.nav.history },
  { href: "/fixed-costs", label: content.nav.fixedCosts },
  { href: "/expense-types", label: content.nav.types },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="bg-surface border-b border-border">
      <div className="mx-auto max-w-3xl px-page">
        <div className="flex items-center justify-between py-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-ink">
            {/* Swap /public/images/logo.png to change this — no code change needed. */}
            <img src="/images/laura_1.webp" alt="" className="h-6 w-6 rounded-full object-cover" />
            {content.appName}
          </Link>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-2 -mb-px">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  "whitespace-nowrap rounded-pill px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-ink-inverse"
                    : "text-ink-muted hover:bg-surface-muted"
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
