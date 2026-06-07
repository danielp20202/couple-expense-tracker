"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { PaidFrom } from "@/lib/types";

export interface ExpenseInput {
  amount: number;
  expense_type_id: string;
  paid_by: string;
  paid_from: PaidFrom;
  date: string;
  note: string | null;
}

function revalidateAll() {
  revalidatePath("/dashboard");
  revalidatePath("/expenses/history");
}

export async function createExpense(input: ExpenseInput) {
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("expenses").insert({
    amount: input.amount,
    expense_type_id: input.expense_type_id,
    paid_by: input.paid_by,
    paid_from: input.paid_from,
    date: input.date,
    note: input.note,
  });
  if (error) return { error: error.message };
  revalidateAll();
  return { error: null };
}

export async function updateExpense(id: string, input: ExpenseInput) {
  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("expenses")
    .update({
      amount: input.amount,
      expense_type_id: input.expense_type_id,
      paid_by: input.paid_by,
      paid_from: input.paid_from,
      date: input.date,
      note: input.note,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
  return { error: null };
}

export async function deleteExpense(id: string) {
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
  return { error: null };
}
