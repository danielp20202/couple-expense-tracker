import { getSupabaseServer } from "@/lib/supabase/server";
import { getCouple } from "@/lib/profiles";
import { content } from "@/content";
import type { ExpenseType } from "@/lib/types";
import { SectionTitle } from "@/app/components/ui";
import { SetupNotice } from "@/app/components/SetupNotice";
import { ExpenseForm } from "./ExpenseForm";

export const dynamic = "force-dynamic";

export default async function AddExpensePage() {
  const couple = await getCouple();
  if (!couple) {
    return (
      <div className="space-y-4">
        <SectionTitle>{content.expenseForm.title}</SectionTitle>
        <SetupNotice />
      </div>
    );
  }

  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("expense_types")
    .select("*")
    .order("name", { ascending: true });

  const types = (data ?? []) as ExpenseType[];

  return (
    <div className="space-y-5">
      <SectionTitle>{content.expenseForm.title}</SectionTitle>
      <ExpenseForm
        types={types}
        personA={couple.personA}
        personB={couple.personB}
      />
    </div>
  );
}
