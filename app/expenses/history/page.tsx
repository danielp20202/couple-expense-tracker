import { getSupabaseServer } from "@/lib/supabase/server";
import { getCouple } from "@/lib/profiles";
import { normalizeMonth, monthBounds } from "@/lib/month";
import { content } from "@/content";
import type { ExpenseType, ExpenseWithType } from "@/lib/types";
import { Card, SectionTitle } from "@/app/components/ui";
import { MonthSwitcher } from "@/app/components/MonthSwitcher";
import { SetupNotice } from "@/app/components/SetupNotice";
import { HistoryTable } from "./HistoryTable";

export const dynamic = "force-dynamic";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const month = normalizeMonth(searchParams.month);
  const couple = await getCouple();

  if (!couple) {
    return (
      <div className="space-y-4">
        <SectionTitle>{content.history.title}</SectionTitle>
        <SetupNotice />
      </div>
    );
  }

  const { start, end } = monthBounds(month);
  const supabase = getSupabaseServer();

  const [expensesRes, typesRes] = await Promise.all([
    supabase
      .from("expenses")
      .select("*, expense_type:expense_types(name)")
      .gte("date", start)
      .lt("date", end)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("expense_types").select("*").order("name", { ascending: true }),
  ]);

  const expenses = (expensesRes.data ?? []) as ExpenseWithType[];
  const types = (typesRes.data ?? []) as ExpenseType[];

  return (
    <div className="space-y-5">
      <SectionTitle>{content.history.title}</SectionTitle>
      <Card>
        <MonthSwitcher month={month} />
      </Card>
      <HistoryTable
        expenses={expenses}
        types={types}
        personA={couple.personA}
        personB={couple.personB}
      />
    </div>
  );
}
