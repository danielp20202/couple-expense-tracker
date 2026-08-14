"use server";

import { revalidatePath } from "next/cache";
import { archivePage, notionProp, updatePageProperties } from "@/lib/notion";

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

/** Sets `personName`'s rating (1-5) on an entry. `value: null` clears it —
 *  tapping an already-set star toggles it off (see StarRating.tsx). Writes to
 *  the existing "<personName> Rating" Notion property (see lib/activities.ts's
 *  ratingsOf for the read side, which discovers these by name pattern). */
export async function rateActivity(pageId: string, personName: string, value: number | null) {
  try {
    await updatePageProperties(pageId, { [`${personName} Rating`]: notionProp.number(value) });
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidatePath("/activities");
  return { error: null };
}
