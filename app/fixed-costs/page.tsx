import { getSupabaseServer } from "@/lib/supabase/server";
import { getCouple } from "@/lib/profiles";
import { content } from "@/content";
import type { ExpenseType, RecurringExpenseWithType } from "@/lib/types";
import { SectionTitle } from "@/app/components/ui";
import { SetupNotice } from "@/app/components/SetupNotice";
import { FixedCostsManager } from "./FixedCostsManager";

export const dynamic = "force-dynamic";

export default async function FixedCostsPage() {
  const couple = await getCouple();
  if (!couple) {
    return (
      <div className="space-y-4">
        <SectionTitle>{content.fixedCosts.title}</SectionTitle>
        <SetupNotice />
      </div>
    );
  }

  const supabase = getSupabaseServer();
  const [{ data: typesData }, { data: recurringData }] = await Promise.all([
    supabase.from("expense_types").select("*").order("name", { ascending: true }),
    supabase
      .from("recurring_expenses")
      .select("*, expense_type:expense_types(name)")
      .order("created_at", { ascending: true }),
  ]);

  const types = (typesData ?? []) as ExpenseType[];
  const recurring = (recurringData ?? []) as RecurringExpenseWithType[];

  return (
    <div className="space-y-5">
      <SectionTitle>{content.fixedCosts.title}</SectionTitle>
      <p className="text-sm text-ink-muted">{content.fixedCosts.help}</p>
      <FixedCostsManager
        recurring={recurring}
        types={types}
        personA={couple.personA}
        personB={couple.personB}
      />
    </div>
  );
}
