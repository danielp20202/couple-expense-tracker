import { sql } from "@/lib/db";
import { content } from "@/content";
import type { Profile } from "@/lib/types";

/**
 * Loads the couple's two profiles. This is a two-person app, so we expect
 * exactly two rows in `profiles` (seeded via the setup SQL). Returns them in a
 * stable order (by created_at) so "Person A" / "Person B" stay consistent.
 */
export async function getCouple(): Promise<{
  personA: Profile;
  personB: Profile;
} | null> {
  let data: Profile[];
  try {
    data = (await sql`
      select id, display_name, partner_id
      from profiles
      order by created_at asc
      limit 2
    `) as Profile[];
  } catch {
    return null;
  }
  if (data.length < 2) return null;

  const [a, b] = data;
  return {
    personA: { ...a, display_name: a.display_name ?? content.config.fallbackPersonA },
    personB: { ...b, display_name: b.display_name ?? content.config.fallbackPersonB },
  };
}
