import { getSupabaseServer } from "@/lib/supabase/server";
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
  const supabase = getSupabaseServer();

  const { data: templates } = await supabase
    .from("recurring_expenses")
    .select("*")
    .eq("active", true);
  const active = (templates ?? []) as RecurringExpense[];
  if (active.length === 0) return 0;

  // Which templates already have an expense in this month?
  const { start, end } = monthBounds(month);
  const { data: existing } = await supabase
    .from("expenses")
    .select("recurring_id")
    .gte("date", start)
    .lt("date", end)
    .not("recurring_id", "is", null);
  const present = new Set((existing ?? []).map((e) => e.recurring_id as string));

  const toSeed = active.filter((t) => !present.has(t.id));
  if (toSeed.length === 0) return 0;

  const date = `${month}-01`;
  const { error } = await supabase.from("expenses").insert(
    toSeed.map((t) => ({
      amount: t.amount,
      expense_type_id: t.expense_type_id,
      paid_by: t.paid_by,
      paid_from: t.paid_from,
      date,
      note: null,
      recurring_id: t.id,
    }))
  );
  if (error) return 0;
  return toSeed.length;
}
