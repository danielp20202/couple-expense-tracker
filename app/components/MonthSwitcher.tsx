"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { content } from "@/content";
import { formatMonthLabel, } from "@/lib/format";
import { shiftMonth } from "@/lib/month";
import { Button } from "@/app/components/ui";

/** Prev / current-month / next control. Stores the month in the ?month= URL param. */
export function MonthSwitcher({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function go(delta: number) {
    const next = shiftMonth(month, delta);
    const sp = new URLSearchParams(params.toString());
    sp.set("month", next);
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <Button variant="ghost" onClick={() => go(-1)}>
        {content.months.prev}
      </Button>
      <span className="text-sm font-semibold text-ink">
        {formatMonthLabel(month)}
      </span>
      <Button variant="ghost" onClick={() => go(1)}>
        {content.months.next}
      </Button>
    </div>
  );
}
