"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import type { ChoreRecurrence } from "@/lib/types";

export interface ChoreInput {
  name: string;
  assigned_to: string | null;
  recurrence: ChoreRecurrence;
  weekdays: number[];
  day_of_month: number | null;
  start_date: string; // YYYY-MM-DD
}

function revalidateAll() {
  revalidatePath("/chores");
  revalidatePath("/chores/manage");
}

/** Normalize an input so unused fields for the chosen recurrence are cleared. */
function normalize(input: ChoreInput) {
  return {
    name: input.name.trim(),
    assigned_to: input.assigned_to || null,
    recurrence: input.recurrence,
    weekdays: input.recurrence === "weekly" ? input.weekdays : [],
    day_of_month: input.recurrence === "monthly" ? input.day_of_month : null,
    start_date: input.start_date,
  };
}

function validate(n: ReturnType<typeof normalize>): string | null {
  if (!n.name) return "Give the chore a name.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(n.start_date)) return "Pick a valid start date.";
  if (n.recurrence === "weekly" && n.weekdays.length === 0)
    return "Pick at least one weekday.";
  if (n.recurrence === "monthly" && (!n.day_of_month || n.day_of_month < 1 || n.day_of_month > 31))
    return "Pick a day of the month (1–31).";
  return null;
}

export async function createChore(input: ChoreInput) {
  const n = normalize(input);
  const err = validate(n);
  if (err) return { error: err };
  try {
    await sql`
      insert into chores (name, assigned_to, recurrence, weekdays, day_of_month, start_date)
      values (${n.name}, ${n.assigned_to}, ${n.recurrence}, ${n.weekdays}::int[], ${n.day_of_month}, ${n.start_date})
    `;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidateAll();
  return { error: null };
}

export async function updateChore(id: string, input: ChoreInput) {
  const n = normalize(input);
  const err = validate(n);
  if (err) return { error: err };
  try {
    await sql`
      update chores set
        name = ${n.name},
        assigned_to = ${n.assigned_to},
        recurrence = ${n.recurrence},
        weekdays = ${n.weekdays}::int[],
        day_of_month = ${n.day_of_month},
        start_date = ${n.start_date}
      where id = ${id}
    `;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidateAll();
  return { error: null };
}

export async function setChoreActive(id: string, active: boolean) {
  try {
    await sql`update chores set active = ${active} where id = ${id}`;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidateAll();
  return { error: null };
}

export async function deleteChore(id: string) {
  try {
    await sql`delete from chores where id = ${id}`;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidateAll();
  return { error: null };
}

/**
 * Toggle a single occurrence done/undone. An occurrence is identified by
 * (chore_id, date); the unique constraint keeps it to one completion. Inserts
 * with the completer if absent, deletes if already present.
 */
export async function toggleChoreCompletion(
  choreId: string,
  date: string,
  completedBy: string | null
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Invalid date." };
  try {
    const existing = (await sql`
      select id from chore_completions where chore_id = ${choreId} and completed_on = ${date}
    `) as { id: string }[];
    if (existing.length > 0) {
      await sql`delete from chore_completions where chore_id = ${choreId} and completed_on = ${date}`;
    } else {
      await sql`
        insert into chore_completions (chore_id, completed_by, completed_on)
        values (${choreId}, ${completedBy}, ${date})
      `;
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidateAll();
  return { error: null };
}
