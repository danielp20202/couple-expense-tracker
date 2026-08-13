import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getCouple } from "@/lib/profiles";
import { computeMonthlySummary, computeSettlementBalance } from "@/lib/calc";
import type { BalanceExpense } from "@/lib/calc";
import { normalizeMonth, monthBounds } from "@/lib/month";
import { todayISO, daysFrom } from "@/lib/week";
import { occurrencesForWeek } from "@/lib/chores";
import { getSelectedProfileId } from "@/lib/profile-session";
import { formatMoney } from "@/lib/format";
import { clsx } from "@/lib/clsx";
import { content } from "@/content";
import type { Expense, Chore, ChoreCompletion } from "@/lib/types";
import { Card, Money, SectionTitle, PageTitle } from "@/app/components/ui";
import { MonthSwitcher } from "@/app/components/MonthSwitcher";
import { SeedFixedCostsButton } from "@/app/components/SeedFixedCostsButton";
import { ProfileSwitcher } from "@/app/components/ProfileSwitcher";
import { SettleTransferButton } from "@/app/components/SettleTransferButton";
import { SetupNotice } from "@/app/components/SetupNotice";
import { UpcomingChores } from "./UpcomingChores";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const selectedId = getSelectedProfileId();
  if (!selectedId) redirect("/select");

  const month = normalizeMonth(searchParams.month);
  const couple = await getCouple();

  if (!couple) {
    return (
      <div className="space-y-4">
        <PageTitle>{content.dashboard.title}</PageTitle>
        <SetupNotice />
      </div>
    );
  }

  const { personA, personB } = couple;
  const me = [personA, personB].find((p) => p.id === selectedId);
  if (!me) redirect("/select");
  const partner = personA.id === selectedId ? personB : personA;

  const { start, end } = monthBounds(month);

  // Per-month expenses → Total / Fair share / Paid-personally cards.
  // Cumulative-through-month expenses + settlements → the carry-over balance.
  const [monthRes, allRes, setlRes, jointRes] = await Promise.all([
    sql`select * from expenses where date >= ${start} and date < ${end}`,
    sql`select amount, paid_from, paid_by, split_profile_id, split_pct from expenses where date < ${end}`,
    sql`select amount from settlements where date < ${end}`,
    sql`select paid_by from recurring_expenses where paid_from = 'joint'`,
  ]);

  // Upcoming chores for the next two weeks, grouped per person below.
  const today = todayISO();
  const choreWindow = daysFrom(today, 14);
  const choreWindowEnd = choreWindow[choreWindow.length - 1];
  const [choreRows, choreCompletionRows] = await Promise.all([
    sql`select * from chores where active = true`,
    sql`select * from chore_completions where completed_on >= ${today} and completed_on <= ${choreWindowEnd}`,
  ]);
  const upcomingOccurrences = occurrencesForWeek(
    choreRows as Chore[],
    choreWindow,
    choreCompletionRows as ChoreCompletion[]
  );

  const expenses = monthRes as Expense[];
  const summary = computeMonthlySummary(expenses, personA, personB);
  const mine = summary.people.find((p) => p.profile.id === selectedId)!;
  const theirs = summary.people.find((p) => p.profile.id !== selectedId)!;
  const hasMonthExpenses = expenses.length > 0;

  // Rent holder = whoever pays the joint rent; depositor = their partner.
  const rentHolderId = (jointRes as { paid_by: string }[]).map((r) => r.paid_by as string)[0] ?? null;
  const depositorId =
    rentHolderId === null
      ? null
      : personA.id === rentHolderId
        ? personB.id
        : personA.id;
  const iAmRentHolder = rentHolderId === selectedId;

  // Cumulative carry-over balance (positive → depositor owes / rent holder reclaims).
  const balance =
    depositorId === null
      ? 0
      : computeSettlementBalance(
          allRes as BalanceExpense[],
          depositorId,
          setlRes as { amount: number }[]
        );

  const positive = balance > 0;
  const negative = balance < 0;
  const abs = Math.abs(balance);
  const partnerName = partner.display_name ?? "";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-ink-muted mb-1">
            {content.profiles.greeting(me.display_name ?? "")}
          </p>
          <PageTitle>{content.dashboard.title}</PageTitle>
        </div>
        <ProfileSwitcher name={me.display_name ?? ""} />
      </div>

      <Card>
        <MonthSwitcher month={month} />
        <div className="mt-3 border-t border-border pt-3">
          <SeedFixedCostsButton month={month} />
        </div>
      </Card>

      <UpcomingChores
        occurrences={upcomingOccurrences}
        personA={personA}
        personB={personB}
        selectedId={selectedId}
        today={today}
      />

      {/* Settlement / transfer card — cumulative, sign-aware. */}
      {rentHolderId && (
        <Card>
          <SectionTitle>
            {iAmRentHolder
              ? content.profiles.reclaimTitle
              : content.profiles.yourTransferTitle}
          </SectionTitle>

          {positive ? (
            <>
              <div className="mb-1 flex items-baseline gap-2">
                <span className={clsx("text-base", iAmRentHolder ? "text-positive" : "text-negative")}>
                  {iAmRentHolder ? "▼" : "▲"}
                </span>
                <span
                  className={clsx(
                    "font-mono text-[11.5px] uppercase tracking-wide font-medium",
                    iAmRentHolder ? "text-positive" : "text-negative"
                  )}
                >
                  {iAmRentHolder ? `${partnerName}'s share` : me.display_name}
                </span>
              </div>
              <Money
                value={formatMoney(balance)}
                tone={iAmRentHolder ? "positive" : "negative"}
                className="block text-[40px] font-semibold leading-none mb-2"
              />
              <p className="text-sm text-ink-muted mb-4">
                {iAmRentHolder
                  ? content.profiles.reclaimHelp
                  : content.profiles.yourTransferHelp}
              </p>
              {iAmRentHolder && rentHolderId && (
                <SettleTransferButton profileId={rentHolderId} amount={balance} />
              )}
            </>
          ) : negative ? (
            <p className="text-sm text-ink-muted">
              {iAmRentHolder
                ? content.profiles.partnerCoveredExtra(partnerName, formatMoney(abs))
                : content.profiles.youCoveredExtra(formatMoney(abs))}
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-base text-positive">&#10003;</span>
              <p className="text-sm text-positive">
                {iAmRentHolder
                  ? content.profiles.allSettled
                  : content.profiles.depositNothing}
              </p>
            </div>
          )}
        </Card>
      )}

      {hasMonthExpenses ? (
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
                {content.dashboard.yourShareLabel}
              </span>
              <Money value={formatMoney(mine.share)} />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-ink-muted text-sm">
                {content.dashboard.partnerShareLabel(partner.display_name ?? "")}
              </span>
              <Money value={formatMoney(theirs.share)} className="text-ink-muted" />
            </div>
          </Card>

          <Card>
            <SectionTitle>{content.dashboard.paidPersonallyLabel}</SectionTitle>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-ink">
                  {me.display_name}{" "}
                  <span className="text-ink-muted text-xs">
                    ({content.profiles.youTag})
                  </span>
                </span>
                <Money value={formatMoney(mine.paidPersonally)} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">{partner.display_name}</span>
                <Money value={formatMoney(theirs.paidPersonally)} className="text-ink-muted" />
              </div>
            </div>
          </Card>
        </>
      ) : (
        !rentHolderId && (
          <Card>
            <p className="text-ink-muted text-sm">
              {content.dashboard.nothingThisMonth}
            </p>
          </Card>
        )
      )}
    </div>
  );
}
