import { sql } from "@/lib/db";
import { monthBounds } from "@/lib/month";
import type { RecurringExpense } from "@/lib/types";

/**
 * Add the month's fixed costs as expenses, skipping any that are ALREADY present
 * in that month.
 *
 * Dedupe is against the actual expense rows (matched by `recurring_id`), not a
 * separate tracking table — so the manual "add fixed costs" button is safe to
 * click repeatedly (no duplicates), and if you delete a fixed cost for a month
 * you can re-add it simply by clicking again.
 *
 * Returns the number of expense rows inserted.
 */
export async function seedMonth(month: string): Promise<number> {
  const active = (await sql`
    select * from recurring_expenses where active = true
  `) as RecurringExpense[];
  if (active.length === 0) return 0;

  // Which templates already have an expense in this month?
  const { start, end } = monthBounds(month);
  const existing = (await sql`
    select recurring_id from expenses
    where date >= ${start} and date < ${end} and recurring_id is not null
  `) as { recurring_id: string }[];
  const present = new Set(existing.map((e) => e.recurring_id as string));

  const toSeed = active.filter((t) => !present.has(t.id));
  if (toSeed.length === 0) return 0;

  const date = `${month}-01`;
  try {
    for (const t of toSeed) {
      await sql`
        insert into expenses (amount, expense_type_id, paid_by, paid_from, date, note, recurring_id)
        values (${t.amount}, ${t.expense_type_id}, ${t.paid_by}, ${t.paid_from}, ${date}, ${null}, ${t.id})
      `;
    }
  } catch {
    return 0;
  }
  return toSeed.length;
}
