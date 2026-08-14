"use server";

import { revalidatePath } from "next/cache";
import { submitSignal, type SubmitSignalInput } from "@/lib/preferences";

/** Records a mood/preference signal — either a global "what we're into this
 *  week" note, or a per-entry "more like this". Read by the (future) weekly
 *  scouting job; nothing on this page changes as a result, so no refresh is
 *  strictly required, but revalidating keeps the underlying data fresh. */
export async function submitPreference(input: SubmitSignalInput) {
  try {
    await submitSignal(input);
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidatePath("/activities");
  return { error: null };
}
