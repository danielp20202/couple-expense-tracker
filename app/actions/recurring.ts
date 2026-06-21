"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
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
  try {
    await sql`
      insert into recurring_expenses (amount, expense_type_id, paid_by, paid_from)
      values (${input.amount}, ${input.expense_type_id}, ${input.paid_by}, ${input.paid_from})
    `;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidateAll();
  return { error: null };
}

export async function updateRecurring(id: string, input: RecurringInput) {
  try {
    await sql`
      update recurring_expenses set
        amount = ${input.amount},
        expense_type_id = ${input.expense_type_id},
        paid_by = ${input.paid_by},
        paid_from = ${input.paid_from}
      where id = ${id}
    `;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidateAll();
  return { error: null };
}

export async function setRecurringActive(id: string, active: boolean) {
  try {
    await sql`update recurring_expenses set active = ${active} where id = ${id}`;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidateAll();
  return { error: null };
}

export async function deleteRecurring(id: string) {
  try {
    await sql`delete from recurring_expenses where id = ${id}`;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
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
