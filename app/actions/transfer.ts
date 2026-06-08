"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Marks (or unmarks) a month's rent reimbursement as transferred back from the
 * joint account to the rent holder's personal account. `doneOn` is the local
 * day the box was checked (passed from the client), cleared when unchecked.
 */
export async function setTransferDone(
  month: string,
  profileId: string,
  done: boolean,
  doneOn: string | null
) {
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("transfer_status").upsert(
    {
      month,
      profile_id: profileId,
      done,
      done_on: done ? doneOn : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "month,profile_id" }
  );
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { error: null };
}
