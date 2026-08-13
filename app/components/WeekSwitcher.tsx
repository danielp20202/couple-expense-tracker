"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { content } from "@/content";
import { formatWeekLabel } from "@/lib/format";
import { shiftWeek, currentWeekMonday } from "@/lib/week";

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
    <div className="flex items-center justify-between gap-3 font-mono text-xs text-ink-muted min-h-[40px]">
      <button type="button" onClick={() => go(-1)} className="px-1 py-2 hover:text-ink transition-colors">
        {content.weeks.prev}
      </button>
      <button
        type="button"
        onClick={goToday}
        className="font-medium uppercase tracking-[0.06em] text-ink hover:text-ink transition-colors"
        title={content.weeks.thisWeek}
      >
        {formatWeekLabel(week)}
        {atCurrentWeek && (
          <span className="ml-2 normal-case tracking-normal text-ink-muted">
            ({content.weeks.thisWeek})
          </span>
        )}
      </button>
      <button type="button" onClick={() => go(1)} className="px-1 py-2 hover:text-ink transition-colors">
        {content.weeks.next}
      </button>
    </div>
  );
}
