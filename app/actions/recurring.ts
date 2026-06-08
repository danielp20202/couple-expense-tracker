"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { seedMonth } from "@/lib/recurring";
import type { PaidFrom } from "@/lib/types";

export interface RecurringInput {
  amount: number;
  expense_type_id: string;
  paid_by: string;
  paid_from: PaidFrom;
}

function revalidateAll() {
  revalidatePath("/fixed-costs");
  revalidatePath("/dashboard");
  revalidatePath("/expenses/history");
}

export async function createRecurring(input: RecurringInput) {
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("recurring_expenses").insert({
    amount: input.amount,
    expense_type_id: input.expense_type_id,
    paid_by: input.paid_by,
    paid_from: input.paid_from,
  });
  if (error) return { error: error.message };
  revalidateAll();
  return { error: null };
}

export async function updateRecurring(id: string, input: RecurringInput) {
  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("recurring_expenses")
    .update({
      amount: input.amount,
      expense_type_id: input.expense_type_id,
      paid_by: input.paid_by,
      paid_from: input.paid_from,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
  return { error: null };
}

export async function setRecurringActive(id: string, active: boolean) {
  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("recurring_expenses")
    .update({ active })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
  return { error: null };
}

export async function deleteRecurring(id: string) {
  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("recurring_expenses")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
  return { error: null };
}

/** Manual "add this month's fixed costs" button (used for past months too). */
export async function seedMonthAction(month: string) {
  if (!/^\d{4}-\d{2}$/.test(month)) return { error: "Invalid month.", added: 0 };
  const added = await seedMonth(month);
  revalidateAll();
  return { error: null, added };
}
