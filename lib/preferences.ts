import { createPage, isNotionConfigured, notionProp, queryDatabaseAll } from "@/lib/notion";

/**
 * "Preference signals" — the household's mood/taste input for the (future)
 * weekly scouting job, e.g. "more Outdoors this week" or "more like this
 * specific entry". Stored as ordinary pages in the *same* Activities Notion
 * database (Entry Kind = "Signal"), reusing its Category/Vibe vocabulary and
 * its existing Notion sharing — see lib/activities.ts for why, and its
 * getActivities() for how these get excluded from the activity list.
 */
export interface Signal {
  id: string;
  who: string;
  scope: "General" | "Entry";
  targetId: string | null;
  categories: string[];
  vibe: string | null;
  note: string | null;
  created: string; // ISO datetime
}

export interface SubmitSignalInput {
  who: string;
  scope: "General" | "Entry";
  /** Required when scope is "Entry" — the activity this is "more like". */
  targetId?: string;
  targetName?: string;
  categories?: string[];
  vibe?: string | null;
  note?: string | null;
}

/** Records a preference signal. Never throws to the caller for missing
 *  config — server actions check isNotionConfigured() themselves, but this
 *  guards direct callers (e.g. a future scouting job) too. */
export async function submitSignal(input: SubmitSignalInput): Promise<void> {
  if (!isNotionConfigured()) throw new Error("NOTION_TOKEN is not set");
  const databaseId = process.env.NOTION_ACTIVITIES_DB_ID!;

  const title =
    input.scope === "Entry"
      ? `${input.who} wants more like "${input.targetName}"`
      : `${input.who} wants more: ${
          [...(input.categories ?? []), input.vibe].filter(Boolean).join(", ") ||
          input.note ||
          "(no detail)"
        }`;

  await createPage(databaseId, {
    Name: notionProp.title(title),
    "Entry Kind": notionProp.select("Signal"),
    "Signal Who": notionProp.richText(input.who),
    Category: notionProp.multiSelect(input.categories ?? []),
    Vibe: notionProp.select(input.vibe ?? null),
    Notes: notionProp.richText(input.note ?? null),
    "Signal Target":
      input.scope === "Entry" && input.targetId ? notionProp.relation([input.targetId]) : notionProp.relation([]),
  });
}

/** Reads every signal from the last `sinceDays` days — for the scouting job. */
export async function getRecentSignals(sinceDays: number): Promise<Signal[]> {
  if (!isNotionConfigured()) return [];
  const databaseId = process.env.NOTION_ACTIVITIES_DB_ID!;
  const cutoff = Date.now() - sinceDays * 24 * 60 * 60 * 1000;

  const pages = await queryDatabaseAll(databaseId, {
    filter: { property: "Entry Kind", select: { equals: "Signal" } },
  });

  return pages
    .map((page) => {
      const p = page.properties ?? {};
      return {
        id: page.id as string,
        who: (p["Signal Who"]?.rich_text ?? []).map((t: any) => t.plain_text ?? "").join("") || "",
        scope: (p["Signal Target"]?.relation?.length ?? 0) > 0 ? "Entry" : "General",
        targetId: p["Signal Target"]?.relation?.[0]?.id ?? null,
        categories: Array.isArray(p.Category?.multi_select)
          ? p.Category.multi_select.map((o: any) => o.name)
          : [],
        vibe: p.Vibe?.select?.name ?? null,
        note: (p.Notes?.rich_text ?? []).map((t: any) => t.plain_text ?? "").join("") || null,
        created: page.created_time as string,
      } as Signal;
    })
    .filter((s) => new Date(s.created).getTime() >= cutoff)
    .sort((a, b) => (a.created < b.created ? 1 : -1));
}
