import { sql } from "@/lib/db";
import { getCouple } from "@/lib/profiles";
import { monthBounds } from "@/lib/month";
import { content } from "@/content";
import { PER_PAGE_OPTIONS, DEFAULT_PER_PAGE } from "@/lib/history";
import type { ExpenseType, ExpenseWithType, Settlement } from "@/lib/types";
import { Card, SectionTitle } from "@/app/components/ui";
import { SetupNotice } from "@/app/components/SetupNotice";
import { HistoryControls } from "./HistoryControls";
import { HistoryTable } from "./HistoryTable";
import { SettlementList } from "./SettlementList";

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

  const bounds = month ? monthBounds(month) : null;

  const expensesPromise = bounds
    ? sql`
        select e.*, et.name as expense_type_name
        from expenses e
        left join expense_types et on et.id = e.expense_type_id
        where e.date >= ${bounds.start} and e.date < ${bounds.end}
        order by e.date desc, e.created_at desc
        limit ${limit}
      `
    : sql`
        select e.*, et.name as expense_type_name
        from expenses e
        left join expense_types et on et.id = e.expense_type_id
        order by e.date desc, e.created_at desc
        limit ${limit}
      `;

  const settlementsPromise = bounds
    ? sql`
        select * from settlements
        where date >= ${bounds.start} and date < ${bounds.end}
        order by date desc
        limit ${limit}
      `
    : sql`select * from settlements order by date desc limit ${limit}`;

  const [expensesRows, settlementsRows, datesRows, typesRows] = await Promise.all([
    expensesPromise,
    settlementsPromise,
    sql`select distinct date from expenses order by date desc`,
    sql`select * from expense_types order by name asc`,
  ]);

  const expenses = (expensesRows as any[]).map((r) => ({
    ...r,
    expense_type: r.expense_type_name ? { name: r.expense_type_name } : null,
  })) as ExpenseWithType[];
  const settlements = settlementsRows as Settlement[];
  const types = typesRows as ExpenseType[];
  const availableMonths = Array.from(
    new Set((datesRows as { date: string }[]).map((r) => r.date.slice(0, 7)))
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

      {settlements.length > 0 && (
        <div className="space-y-3">
          <SectionTitle>{content.history.transfersTitle}</SectionTitle>
          <SettlementList settlements={settlements} />
        </div>
      )}
    </div>
  );
}
