/**
 * Helpers for the Monday-anchored "selected week" used by the chores view.
 * Weeks are identified by their Monday as a "YYYY-MM-DD" string, mirroring how
 * lib/month.ts identifies months by "YYYY-MM". All date math is done in local
 * time to match the rest of the app (dates are stored as plain YYYY-MM-DD).
 */

/** Format a Date as a local "YYYY-MM-DD" string (no timezone shift). */
function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Parse a "YYYY-MM-DD" into a local Date at midnight. */
export function parseDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** The Monday (as "YYYY-MM-DD") of the week containing the given date. */
export function mondayOf(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift back to Monday
  d.setDate(d.getDate() + diff);
  return toISODate(d);
}

/** Monday of the current week, "YYYY-MM-DD". */
export function currentWeekMonday(): string {
  return mondayOf(new Date());
}

/** Validate a week string (must be a Monday); fall back to the current week. */
export function normalizeWeek(week: string | undefined | null): string {
  if (week && /^\d{4}-\d{2}-\d{2}$/.test(week)) {
    // Snap to the Monday of whatever date was passed, so a stray date is safe.
    return mondayOf(parseDate(week));
  }
  return currentWeekMonday();
}

/** Step a week's Monday forward/backward by `delta` weeks. */
export function shiftWeek(monday: string, delta: number): string {
  const d = parseDate(monday);
  d.setDate(d.getDate() + delta * 7);
  return toISODate(d);
}

/** The seven "YYYY-MM-DD" dates (Mon..Sun) of the week starting at `monday`. */
export function weekDays(monday: string): string[] {
  const start = parseDate(monday);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return toISODate(d);
  });
}
