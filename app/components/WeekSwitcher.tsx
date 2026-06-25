"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { content } from "@/content";
import { formatWeekLabel } from "@/lib/format";
import { shiftWeek, currentWeekMonday } from "@/lib/week";
import { Button } from "@/app/components/ui";

/**
 * Prev / week-label / next control. Stores the week's Monday in the ?week= URL
 * param. Unlike the month switcher, future weeks ARE allowed — recurring chores
 * extend forward, so looking ahead is useful.
 */
export function WeekSwitcher({ week }: { week: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const atCurrentWeek = week === currentWeekMonday();

  function go(delta: number) {
    const next = shiftWeek(week, delta);
    const sp = new URLSearchParams(params.toString());
    sp.set("week", next);
    router.push(`${pathname}?${sp.toString()}`);
  }

  function goToday() {
    const sp = new URLSearchParams(params.toString());
    sp.set("week", currentWeekMonday());
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <Button variant="ghost" onClick={() => go(-1)}>
        {content.weeks.prev}
      </Button>
      <button
        type="button"
        onClick={goToday}
        className="text-sm font-semibold text-ink hover:text-primary transition-colors"
        title={content.weeks.thisWeek}
      >
        {formatWeekLabel(week)}
        {atCurrentWeek && (
          <span className="ml-2 text-xs font-medium text-ink-muted">
            {content.weeks.thisWeek}
          </span>
        )}
      </button>
      <Button variant="ghost" onClick={() => go(1)}>
        {content.weeks.next}
      </Button>
    </div>
  );
}
