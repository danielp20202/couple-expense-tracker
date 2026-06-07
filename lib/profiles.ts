import { getSupabaseServer } from "@/lib/supabase/server";
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
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, partner_id")
    .order("created_at", { ascending: true })
    .limit(2);

  if (error || !data || data.length < 2) return null;

  const [a, b] = data as Profile[];
  return {
    personA: { ...a, display_name: a.display_name ?? content.config.fallbackPersonA },
    personB: { ...b, display_name: b.display_name ?? content.config.fallbackPersonB },
  };
}
