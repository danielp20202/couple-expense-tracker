import { getSupabaseServer } from "@/lib/supabase/server";
import { getCouple } from "@/lib/profiles";
import { computeMonthlySummary } from "@/lib/calc";
import { normalizeMonth, monthBounds } from "@/lib/month";
import { formatMoney } from "@/lib/format";
import { content } from "@/content";
import type { Expense } from "@/lib/types";
import { Card, Money, SectionTitle } from "@/app/components/ui";
import { MonthSwitcher } from "@/app/components/MonthSwitcher";
import { SeedFixedCostsButton } from "@/app/components/SeedFixedCostsButton";
import { SetupNotice } from "@/app/components/SetupNotice";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const month = normalizeMonth(searchParams.month);
  const couple = await getCouple();

  if (!couple) {
    return (
      <div className="space-y-4">
        <SectionTitle>{content.dashboard.title}</SectionTitle>
        <SetupNotice />
      </div>
    );
  }

  const { personA, personB } = couple;
  const { start, end } = monthBounds(month);

  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("expenses")
    .select("*")
    .gte("date", start)
    .lt("date", end);

  const expenses = (data ?? []) as Expense[];
  const summary = computeMonthlySummary(expenses, personA, personB);
  const hasExpenses = expenses.length > 0;

  return (
    <div className="space-y-5">
      <SectionTitle>{content.dashboard.title}</SectionTitle>

      <Card>
        <MonthSwitcher month={month} />
        <div className="mt-3 border-t border-border pt-3">
          <SeedFixedCostsButton month={month} />
        </div>
      </Card>

      {!hasExpenses ? (
        <Card>
          <p className="text-ink-muted text-sm">
            {content.dashboard.nothingThisMonth}
          </p>
        </Card>
      ) : (
        <>
          <Card>
            <div className="flex items-baseline justify-between">
              <span className="text-ink-muted text-sm">
                {content.dashboard.totalLabel}
              </span>
              <Money value={formatMoney(summary.total)} className="text-2xl font-semibold" />
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-border pt-2">
              <span className="text-ink-muted text-sm">
                {content.dashboard.fairShareLabel}
              </span>
              <Money value={formatMoney(summary.fairShare)} />
            </div>
          </Card>

          <Card>
            <SectionTitle>{content.dashboard.paidPersonallyLabel}</SectionTitle>
            <div className="space-y-2">
              {summary.people.map((p) => (
                <div key={p.profile.id} className="flex items-center justify-between">
                  <span className="text-ink">{p.profile.display_name}</span>
                  <Money value={formatMoney(p.paidPersonally)} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle>{content.dashboard.transferTitle}</SectionTitle>
            <p className="text-sm text-ink-muted mb-3">
              {content.dashboard.transferHelp}
            </p>
            <div className="space-y-2">
              {summary.people.map((p) => (
                <div key={p.profile.id} className="flex items-center justify-between">
                  <span className="text-ink font-medium">{p.profile.display_name}</span>
                  <Money
                    value={formatMoney(p.transferToJoint)}
                    className="text-lg font-semibold"
                  />
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
