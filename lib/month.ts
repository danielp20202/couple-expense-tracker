/** Helpers for the YYYY-MM "selected month" used across the app. */

/** Current month as "YYYY-MM" in local time. */
export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Validate a "YYYY-MM" string, falling back to the current month. */
export function normalizeMonth(month: string | undefined | null): string {
  if (month && /^\d{4}-\d{2}$/.test(month)) return month;
  return currentMonth();
}

/** Inclusive first day and exclusive next-month first day, for date range queries. */
export function monthBounds(month: string): { start: string; end: string } {
  const [y, m] = month.split("-").map(Number);
  const start = `${month}-01`;
  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;
  const end = `${nextY}-${String(nextM).padStart(2, "0")}-01`;
  return { start, end };
}

/** Step a "YYYY-MM" forward/backward by `delta` months. */
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
