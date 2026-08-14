import { isNotionConfigured, queryDatabaseAll } from "@/lib/notion";
import type { Activity } from "@/lib/types";

/** Ordered the same way as the "By status" board in Notion. */
export const ACTIVITY_STATUS_ORDER = ["Want to try", "Planned", "Done"] as const;

type NotionProperty = Record<string, any>;

function plainText(prop: NotionProperty | undefined): string | null {
  const rich = prop?.rich_text ?? prop?.title;
  if (!Array.isArray(rich) || rich.length === 0) return null;
  const s = rich.map((t: any) => t.plain_text ?? "").join("");
  return s || null;
}
function numberValue(prop: NotionProperty | undefined): number | null {
  return typeof prop?.number === "number" ? prop.number : null;
}
function selectName(prop: NotionProperty | undefined): string | null {
  return prop?.select?.name ?? null;
}
function statusName(prop: NotionProperty | undefined): string | null {
  return prop?.status?.name ?? null;
}
function multiSelectNames(prop: NotionProperty | undefined): string[] {
  return Array.isArray(prop?.multi_select) ? prop.multi_select.map((o: any) => o.name) : [];
}
function urlValue(prop: NotionProperty | undefined): string | null {
  return prop?.url ?? null;
}
function dateStart(prop: NotionProperty | undefined): string | null {
  return prop?.date?.start ?? null;
}
function coverImageUrl(page: any): string | null {
  const cover = page.cover;
  if (!cover) return null;
  if (cover.type === "external") return cover.external?.url ?? null;
  if (cover.type === "file") return cover.file?.url ?? null;
  return null;
}

/** Any property literally named "<Someone> Rating" is a per-person rating —
 *  scanned by name pattern rather than hardcoded, so this doesn't care who
 *  the two people are or how many "Rating" columns exist. */
function ratingsOf(p: Record<string, NotionProperty>): { name: string; value: number | null }[] {
  return Object.keys(p)
    .filter((key) => key.endsWith(" Rating"))
    .map((key) => ({ name: key.slice(0, -" Rating".length), value: numberValue(p[key]) }));
}

/** Returns null for blank rows (e.g. an accidental empty "+ New" row in the
 *  source database) so they're filtered out rather than shown as "Untitled". */
function mapPage(page: any): Activity | null {
  const p: Record<string, NotionProperty> = page.properties ?? {};
  const name = plainText(p.Name);
  if (!name) return null;
  return {
    id: page.id,
    name,
    type: selectName(p.Type),
    status: statusName(p.Status),
    categories: multiSelectNames(p.Category),
    who: selectName(p.Who),
    city: plainText(p.City),
    driveTimeMinutes: numberValue(p["Drive time"]),
    indoorOutdoor: selectName(p["Indoor/Outdoor"]),
    seasons: multiSelectNames(p.Season),
    vibe: selectName(p.Vibe),
    estCost: numberValue(p["Est. cost"]),
    rating: numberValue(p.Rating),
    link: urlValue(p.Link),
    mapLink: urlValue(p["Map link"]),
    description: plainText(p.Description),
    notes: plainText(p.Notes),
    tip: plainText(p.Tip),
    targetDate: dateStart(p["Target date"]),
    coverImage: coverImageUrl(page),
    ratings: ratingsOf(p),
  };
}

/** Reads every row from the "Activities" Notion database, excluding "Signal"
 *  rows (preference-log entries — see lib/preferences.ts — stored in this
 *  same database so they inherit its Notion sharing, but never shown as an
 *  activity). Returns [] (rather than throwing) when Notion isn't configured,
 *  so the page can show a setup notice instead of a hard error. */
export async function getActivities(): Promise<Activity[]> {
  if (!isNotionConfigured()) return [];
  const databaseId = process.env.NOTION_ACTIVITIES_DB_ID!;
  const pages = await queryDatabaseAll(databaseId);
  const activities = pages
    .filter((page) => page.properties?.["Entry Kind"]?.select?.name !== "Signal")
    .map(mapPage)
    .filter((a): a is Activity => a !== null);

  const rank = (status: string | null) => {
    const i = ACTIVITY_STATUS_ORDER.indexOf((status ?? "") as any);
    return i === -1 ? ACTIVITY_STATUS_ORDER.length : i;
  };
  return activities.sort((a, b) => rank(a.status) - rank(b.status) || a.name.localeCompare(b.name));
}
