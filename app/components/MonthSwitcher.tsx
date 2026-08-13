"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { content } from "@/content";
import { formatMonthLabel, } from "@/lib/format";
import { shiftMonth, currentMonth } from "@/lib/month";
import { clsx } from "@/lib/clsx";

/**
 * Prev / current-month / next control. Stores the month in the ?month= URL param.
 * Future months are disabled — the running balance carries forward, so there's
 * nothing meaningful to show beyond the current month.
 */
export function MonthSwitcher({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const atCurrentMonth = month >= currentMonth();

  function go(delta: number) {
    const next = shiftMonth(month, delta);
    const sp = new URLSearchParams(params.toString());
    sp.set("month", next);
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex items-center justify-between gap-3 font-mono text-xs text-ink-muted min-h-[40px]">
      <button type="button" onClick={() => go(-1)} className="px-1 py-2 hover:text-ink transition-colors">
        {content.months.prev}
      </button>
      <span className="font-medium uppercase tracking-[0.06em] text-ink">
        {formatMonthLabel(month)}
      </span>
      <button
        type="button"
        onClick={() => go(1)}
        disabled={atCurrentMonth}
        className={clsx("px-1 py-2 hover:text-ink transition-colors", atCurrentMonth && "invisible")}
      >
        {content.months.next}
      </button>
    </div>
  );
}
