"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { content } from "@/content";
import { formatMonthLabel } from "@/lib/format";
import { PER_PAGE_OPTIONS } from "@/lib/history";
import { Label, Select } from "@/app/components/ui";

/**
 * Month filter + page-size selector for the history list. Both write to the URL
 * query (?month=&limit=) so the server component re-fetches the right slice.
 */
export function HistoryControls({
  month,
  limit,
  availableMonths,
}: {
  month: string | null;
  limit: number;
  availableMonths: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") params.delete(key);
    else params.set(key, value);
    router.push(`/expenses/history?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="min-w-[10rem]">
        <Label htmlFor="month-filter">{content.history.monthFilterLabel}</Label>
        <Select
          id="month-filter"
          value={month ?? ""}
          onChange={(e) => setParam("month", e.target.value || null)}
        >
          <option value="">{content.history.allMonths}</option>
          {availableMonths.map((m) => (
            <option key={m} value={m}>
              {formatMonthLabel(m)}
            </option>
          ))}
        </Select>
      </div>

      <div className="min-w-[8rem]">
        <Label htmlFor="per-page">{content.history.perPageLabel}</Label>
        <Select
          id="per-page"
          value={String(limit)}
          onChange={(e) => setParam("limit", e.target.value)}
        >
          {PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} {content.history.perPageSuffix}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
