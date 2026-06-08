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
  if (pathname === "/select") return null;
  return (
    <nav className="bg-background border-b border-border">
      <div className="mx-auto max-w-3xl px-page">
        <div className="flex items-center justify-between py-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold text-ink tracking-tight">
            <img src="/images/laura_1.webp" alt="" className="h-7 w-7 rounded-full object-cover ring-2 ring-border" />
            {content.appName}
          </Link>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-3 -mb-px">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  "whitespace-nowrap rounded-pill px-4 py-2 text-sm font-medium transition-colors min-h-[40px] flex items-center",
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
