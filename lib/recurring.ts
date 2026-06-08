import { getSupabaseServer } from "@/lib/supabase/server";
import type { RecurringExpense } from "@/lib/types";

/**
 * Fill a month with its "fixed cost" expenses from the active recurring
 * templates.
 *
 * Idempotent and resurrection-safe: we record each (template, month) pair in
 * `recurring_seeded` once it's been filled, so a fixed cost lands in a given
 * month at most once. If you later edit or delete that month's copy, it won't
 * silently come back.
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

  const { data: seededRows } = await supabase
    .from("recurring_seeded")
    .select("recurring_id")
    .eq("month", month);

  const seeded = new Set((seededRows ?? []).map((r) => r.recurring_id as string));
  const toSeed = active.filter((t) => !seeded.has(t.id));
  if (toSeed.length === 0) return 0;

  const date = `${month}-01`;
  const { error: insertErr } = await supabase.from("expenses").insert(
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
  if (insertErr) return 0;

  // Mark them seeded so they won't be regenerated for this month.
  await supabase
    .from("recurring_seeded")
    .insert(toSeed.map((t) => ({ recurring_id: t.id, month })));

  return toSeed.length;
}
