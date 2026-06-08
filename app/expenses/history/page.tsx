import { getSupabaseServer } from "@/lib/supabase/server";
import { getCouple } from "@/lib/profiles";
import { monthBounds } from "@/lib/month";
import { content } from "@/content";
import { PER_PAGE_OPTIONS, DEFAULT_PER_PAGE } from "@/lib/history";
import type { ExpenseType, ExpenseWithType } from "@/lib/types";
import { Card, SectionTitle } from "@/app/components/ui";
import { SetupNotice } from "@/app/components/SetupNotice";
import { HistoryControls } from "./HistoryControls";
import { HistoryTable } from "./HistoryTable";

export const dynamic = "force-dynamic";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { month?: string; limit?: string };
}) {
  const couple = await getCouple();
  if (!couple) {
    return (
      <div className="space-y-4">
        <SectionTitle>{content.history.title}</SectionTitle>
        <SetupNotice />
      </div>
    );
  }

  // A valid YYYY-MM means "filter to this month"; absent means "all months".
  const month =
    searchParams.month && /^\d{4}-\d{2}$/.test(searchParams.month)
      ? searchParams.month
      : null;

  const parsedLimit = Number(searchParams.limit);
  const limit = (PER_PAGE_OPTIONS as readonly number[]).includes(parsedLimit)
    ? parsedLimit
    : DEFAULT_PER_PAGE;

  const supabase = getSupabaseServer();

  let query = supabase
    .from("expenses")
    .select("*, expense_type:expense_types(name)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (month) {
    const { start, end } = monthBounds(month);
    query = query.gte("date", start).lt("date", end);
  }

  const [expensesRes, datesRes, typesRes] = await Promise.all([
    query,
    supabase.from("expenses").select("date").order("date", { ascending: false }),
    supabase.from("expense_types").select("*").order("name", { ascending: true }),
  ]);

  const expenses = (expensesRes.data ?? []) as ExpenseWithType[];
  const types = (typesRes.data ?? []) as ExpenseType[];
  const availableMonths = Array.from(
    new Set(((datesRes.data ?? []) as { date: string }[]).map((r) => r.date.slice(0, 7)))
  );

  return (
    <div className="space-y-5">
      <SectionTitle>{content.history.title}</SectionTitle>

      <Card>
        <HistoryControls
          month={month}
          limit={limit}
          availableMonths={availableMonths}
        />
      </Card>

      {!month && expenses.length > 0 && (
        <p className="text-sm text-ink-muted">
          {content.history.showingRecent(expenses.length)}
        </p>
      )}

      <HistoryTable
        expenses={expenses}
        types={types}
        personA={couple.personA}
        personB={couple.personB}
      />
    </div>
  );
}
