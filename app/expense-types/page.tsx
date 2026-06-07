import { getSupabaseServer } from "@/lib/supabase/server";
import { getCouple } from "@/lib/profiles";
import { content } from "@/content";
import type { ExpenseType } from "@/lib/types";
import { SectionTitle } from "@/app/components/ui";
import { TypesManager } from "./TypesManager";

export const dynamic = "force-dynamic";

export default async function ExpenseTypesPage() {
  const supabase = getSupabaseServer();
  const couple = await getCouple();
  const { data } = await supabase
    .from("expense_types")
    .select("*")
    .order("name", { ascending: true });

  const types = (data ?? []) as ExpenseType[];

  return (
    <div className="space-y-5">
      <SectionTitle>{content.types.title}</SectionTitle>
      <p className="text-sm text-ink-muted">{content.types.help}</p>
      <TypesManager types={types} createdBy={couple?.personA.id ?? null} />
    </div>
  );
}
