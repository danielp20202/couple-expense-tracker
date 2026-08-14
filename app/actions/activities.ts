"use server";

import { revalidatePath } from "next/cache";
import { archivePage } from "@/lib/notion";

/** Archives the entry in Notion (its source of truth). Recoverable from
 *  Notion's own trash — this app has no separate undo. */
export async function deleteActivity(pageId: string) {
  try {
    await archivePage(pageId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidatePath("/activities");
  return { error: null };
}
