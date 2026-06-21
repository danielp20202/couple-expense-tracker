"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";

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
  try {
    await sql`
      insert into settlements (profile_id, amount, date)
      values (${profileId}, ${amount}, ${date})
    `;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidateAll();
  return { error: null };
}

/** Undo a logged transfer. */
export async function deleteSettlement(id: string) {
  try {
    await sql`delete from settlements where id = ${id}`;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidateAll();
  return { error: null };
}
