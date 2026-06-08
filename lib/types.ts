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
  recurring_id: string | null;
  created_at: string;
}

/** An expense joined with its category name, as shown in the history list. */
export interface ExpenseWithType extends Expense {
  expense_type: { name: string } | null;
}

/** A "fixed cost" template that pre-populates each month. */
export interface RecurringExpense {
  id: string;
  amount: number;
  expense_type_id: string | null;
  paid_by: string;
  paid_from: PaidFrom;
  active: boolean;
  created_at: string;
}

/** A recurring template joined with its category name, for the manager UI. */
export interface RecurringExpenseWithType extends RecurringExpense {
  expense_type: { name: string } | null;
}

/** Tracks whether a month's rent reimbursement has been transferred back. */
export interface TransferStatus {
  month: string;
  profile_id: string;
  done: boolean;
  done_on: string | null; // YYYY-MM-DD
  updated_at: string;
}
