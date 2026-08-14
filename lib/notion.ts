/**
 * Notion API client — SERVER-SIDE ONLY.
 *
 * NOTION_TOKEN is an internal-integration secret; it must never reach the
 * browser, so this module is only imported from server components/actions.
 * Plain fetch, no SDK — keeps dependencies minimal (same approach as the
 * Neon migration: raw calls over a query-builder library).
 *
 * Every page is force-dynamic and Notion content can change between visits,
 * so requests are never cached (cache: "no-store"), matching how lib/db.ts
 * always reads fresh from Postgres.
 */

const NOTION_VERSION = "2022-06-28";

export function isNotionConfigured(): boolean {
  return Boolean(process.env.NOTION_TOKEN && process.env.NOTION_ACTIVITIES_DB_ID);
}

async function notionFetch(path: string, init: RequestInit = {}): Promise<any> {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN is not set");

  const res = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Notion API ${res.status} ${res.statusText}: ${body}`);
  }
  return res.json();
}

/** Archives (soft-deletes) a page — recoverable from Notion's own trash. */
export async function archivePage(pageId: string): Promise<void> {
  await notionFetch(`/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({ archived: true }),
  });
}

/** Query every row of a database, following pagination automatically. */
export async function queryDatabaseAll(
  databaseId: string,
  body: Record<string, unknown> = {}
): Promise<any[]> {
  const pages: any[] = [];
  let cursor: string | undefined;
  do {
    const res = await notionFetch(`/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify(cursor ? { ...body, start_cursor: cursor } : body),
    });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return pages;
}

/** Updates a page's properties. Values must already be in Notion's property-value
 *  shape — build them with `notionProp.*` below rather than passing raw JS values. */
export async function updatePageProperties(
  pageId: string,
  properties: Record<string, unknown>
): Promise<void> {
  await notionFetch(`/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });
}

/** Creates a page in a database. Same property-value shape rule as above. */
export async function createPage(
  databaseId: string,
  properties: Record<string, unknown>
): Promise<{ id: string }> {
  return notionFetch(`/pages`, {
    method: "POST",
    body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
  });
}

/** Builders for Notion's per-type property-value JSON shape (write side — the
 *  read side lives in lib/activities.ts's own small parsers). */
export const notionProp = {
  title: (s: string) => ({ title: s ? [{ type: "text", text: { content: s } }] : [] }),
  richText: (s: string | null) => ({
    rich_text: s ? [{ type: "text", text: { content: s } }] : [],
  }),
  number: (n: number | null) => ({ number: n }),
  select: (name: string | null) => ({ select: name ? { name } : null }),
  multiSelect: (names: string[]) => ({ multi_select: names.map((name) => ({ name })) }),
  relation: (ids: string[]) => ({ relation: ids.map((id) => ({ id })) }),
};
