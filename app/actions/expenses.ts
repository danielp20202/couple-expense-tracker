"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
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
  try {
    await sql`
      insert into expenses (amount, expense_type_id, paid_by, paid_from, date, note)
      values (${input.amount}, ${input.expense_type_id}, ${input.paid_by}, ${input.paid_from}, ${input.date}, ${input.note})
    `;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidateAll();
  return { error: null };
}

export async function updateExpense(id: string, input: ExpenseInput) {
  try {
    await sql`
      update expenses set
        amount = ${input.amount},
        expense_type_id = ${input.expense_type_id},
        paid_by = ${input.paid_by},
        paid_from = ${input.paid_from},
        date = ${input.date},
        note = ${input.note}
      where id = ${id}
    `;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidateAll();
  return { error: null };
}

export async function deleteExpense(id: string) {
  try {
    await sql`delete from expenses where id = ${id}`;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidateAll();
  return { error: null };
}

export async function deleteExpenses(ids: string[]) {
  if (ids.length === 0) return { error: null };
  try {
    await sql`delete from expenses where id = any(${ids})`;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidateAll();
  return { error: null };
}
