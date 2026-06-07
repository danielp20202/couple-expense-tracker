"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";

function revalidateAll() {
  revalidatePath("/expense-types");
  revalidatePath("/expenses");
}

export async function createType(name: string, createdBy: string | null) {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name is required." };
  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("expense_types")
    .insert({ name: trimmed, created_by: createdBy });
  if (error) return { error: error.message };
  revalidateAll();
  return { error: null };
}

export async function renameType(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name is required." };
  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("expense_types")
    .update({ name: trimmed })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
  return { error: null };
}

export async function deleteType(id: string) {
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("expense_types").delete().eq("id", id);
  // A foreign-key violation here means expenses still reference this category.
  if (error) return { error: error.message };
  revalidateAll();
  return { error: null };
}
