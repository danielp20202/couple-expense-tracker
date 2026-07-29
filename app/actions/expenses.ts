"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import type { PaidFrom } from "@/lib/types";

export interface ExpenseInput {
  amount: number;
  expense_type_id: string;
  paid_by: string;
  paid_from: PaidFrom;
  /** split_pct% of the amount is split_profile_id's share (null = 50/50). */
  split_profile_id: string | null;
  split_pct: number;
  date: string;
  note: string | null;
}

function revalidateAll() {
  revalidatePath("/dashboard");
  revalidatePath("/expenses/history");
}

/** Normalize the split: a 50 always stores as the canonical null/50 pair. */
function normalizeSplit(input: ExpenseInput): { anchor: string | null; pct: number } {
  const pct = Number(input.split_pct);
  if (!input.split_profile_id || pct === 50) return { anchor: null, pct: 50 };
  return { anchor: input.split_profile_id, pct };
}

function validateSplit(input: ExpenseInput): string | null {
  const pct = Number(input.split_pct);
  if (!Number.isFinite(pct) || pct < 0 || pct > 100)
    return "Split must be between 0 and 100.";
  return null;
}

export async function createExpense(input: ExpenseInput) {
  const splitErr = validateSplit(input);
  if (splitErr) return { error: splitErr };
  const split = normalizeSplit(input);
  try {
    await sql`
      insert into expenses (amount, expense_type_id, paid_by, paid_from, split_profile_id, split_pct, date, note)
      values (${input.amount}, ${input.expense_type_id}, ${input.paid_by}, ${input.paid_from}, ${split.anchor}, ${split.pct}, ${input.date}, ${input.note})
    `;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidateAll();
  return { error: null };
}

export async function updateExpense(id: string, input: ExpenseInput) {
  const splitErr = validateSplit(input);
  if (splitErr) return { error: splitErr };
  const split = normalizeSplit(input);
  try {
    await sql`
      update expenses set
        amount = ${input.amount},
        expense_type_id = ${input.expense_type_id},
        paid_by = ${input.paid_by},
        paid_from = ${input.paid_from},
        split_profile_id = ${split.anchor},
        split_pct = ${split.pct},
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
