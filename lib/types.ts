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

/** A logged transfer the rent holder made from the joint account to their own. */
export interface Settlement {
  id: string;
  profile_id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  created_at: string;
}

/** How often a chore repeats. */
export type ChoreRecurrence = "once" | "daily" | "weekly" | "monthly";

/** A household chore definition. Occurrences are computed per week from the
 *  recurrence rule (see lib/chores.ts), not stored. */
export interface Chore {
  id: string;
  name: string;
  assigned_to: string | null; // profile id; null = unassigned / either
  recurrence: ChoreRecurrence;
  weekdays: number[]; // 0=Sun..6=Sat, used when recurrence = 'weekly'
  day_of_month: number | null; // 1..31, used when recurrence = 'monthly'
  start_date: string; // YYYY-MM-DD anchor; occurrences only on/after this
  active: boolean;
  created_at: string;
}

/** A logged completion of a specific chore occurrence (chore_id + date). */
export interface ChoreCompletion {
  id: string;
  chore_id: string;
  completed_by: string | null;
  completed_on: string; // YYYY-MM-DD
  created_at: string;
}

/** A single occurrence of a chore on a given date, with its completion state.
 *  Built in memory for the displayed week. */
export interface ChoreOccurrence {
  chore: Chore;
  date: string; // YYYY-MM-DD
  done: boolean;
  completed_by: string | null;
}
