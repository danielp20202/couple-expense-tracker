"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";

function revalidateAll() {
  revalidatePath("/expense-types");
  revalidatePath("/expenses");
}

export async function createType(name: string, createdBy: string | null) {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name is required." };
  try {
    await sql`insert into expense_types (name, created_by) values (${trimmed}, ${createdBy})`;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidateAll();
  return { error: null };
}

export async function renameType(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name is required." };
  try {
    await sql`update expense_types set name = ${trimmed} where id = ${id}`;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidateAll();
  return { error: null };
}

export async function deleteType(id: string) {
  // A foreign-key violation here means expenses still reference this category.
  try {
    await sql`delete from expense_types where id = ${id}`;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidateAll();
  return { error: null };
}
