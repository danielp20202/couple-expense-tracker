/** Shared TypeScript types for the database rows the app works with. */

export type PaidFrom = "personal" | "joint";

export interface Profile {
  id: string;
  display_name: string | null;
  partner_id: string | null;
}

export interface ExpenseType {
  id: string;
  name: string;
  created_by: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  amount: number;
  expense_type_id: string | null;
  paid_by: string;
  paid_from: PaidFrom;
  date: string; // YYYY-MM-DD
  note: string | null;
  created_at: string;
}

/** An expense joined with its category name, as shown in the history list. */
export interface ExpenseWithType extends Expense {
  expense_type: { name: string } | null;
}
