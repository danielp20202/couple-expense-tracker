import type { Chore, ChoreCompletion, ChoreOccurrence } from "@/lib/types";
import { parseDate } from "@/lib/week";

/** Days in the month of a given local Date (handles leap years). */
function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/**
 * Does `chore` occur on the given "YYYY-MM-DD" date? Applies the recurrence
 * rule, respecting `start_date` (no occurrences before the anchor).
 */
export function occursOn(chore: Chore, date: string): boolean {
  if (date < chore.start_date) return false;
  const d = parseDate(date);

  switch (chore.recurrence) {
    case "once":
      return date === chore.start_date;
    case "daily":
      return true;
    case "weekly":
      return chore.weekdays.includes(d.getDay());
    case "monthly": {
      const dom = chore.day_of_month ?? parseDate(chore.start_date).getDate();
      // Clamp to the last day for short months (e.g. day 31 in February → 28/29).
      const target = Math.min(dom, daysInMonth(d));
      return d.getDate() === target;
    }
    default:
      return false;
  }
}

/**
 * Expand `chores` into their occurrences across `days` (an ordered list of
 * "YYYY-MM-DD"), annotated with completion state from `completions`.
 * Completions are keyed by `chore_id|completed_on`.
 */
export function occurrencesForWeek(
  chores: Chore[],
  days: string[],
  completions: ChoreCompletion[]
): ChoreOccurrence[] {
  const doneBy = new Map<string, string | null>();
  for (const c of completions) {
    doneBy.set(`${c.chore_id}|${c.completed_on}`, c.completed_by);
  }

  const out: ChoreOccurrence[] = [];
  for (const date of days) {
    for (const chore of chores) {
      if (!occursOn(chore, date)) continue;
      const key = `${chore.id}|${date}`;
      out.push({
        chore,
        date,
        done: doneBy.has(key),
        completed_by: doneBy.get(key) ?? null,
      });
    }
  }
  return out;
}
