"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";

function revalidateAll() {
  revalidatePath("/dashboard");
  revalidatePath("/expenses/history");
}

/** Log a transfer the rent holder made from the joint account to their account. */
export async function createSettlement(
  profileId: string,
  amount: number,
  date: string
) {
  if (!(amount > 0)) return { error: "Nothing to transfer." };
  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("settlements")
    .insert({ profile_id: profileId, amount, date });
  if (error) return { error: error.message };
  revalidateAll();
  return { error: null };
}

/** Undo a logged transfer. */
export async function deleteSettlement(id: string) {
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("settlements").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
  return { error: null };
}
