import Link from "next/link";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getCouple } from "@/lib/profiles";
import { computeMonthlySummary, computeSettlementBalance } from "@/lib/calc";
import type { BalanceExpense } from "@/lib/calc";
import { normalizeMonth, monthBounds } from "@/lib/month";
import { getSelectedProfileId } from "@/lib/profile-session";
import { formatMoney } from "@/lib/format";
import { content } from "@/content";
import type { Expense } from "@/lib/types";
import { Card, Money, SectionTitle } from "@/app/components/ui";
import { MonthSwitcher } from "@/app/components/MonthSwitcher";
import { SeedFixedCostsButton } from "@/app/components/SeedFixedCostsButton";
import { ProfileSwitcher } from "@/app/components/ProfileSwitcher";
import { SettleTransferButton } from "@/app/components/SettleTransferButton";
import { SetupNotice } from "@/app/components/SetupNotice";

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
        <SectionTitle>{content.dashboard.title}</SectionTitle>
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
    sql`select amount, paid_from, paid_by from expenses where date < ${end}`,
    sql`select amount from settlements where date < ${end}`,
    sql`select paid_by from recurring_expenses where paid_from = 'joint'`,
  ]);

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
          <p className="text-ink-muted text-sm">
            {content.profiles.greeting(me.display_name ?? "")}
          </p>
          <SectionTitle>{content.dashboard.title}</SectionTitle>
        </div>
        <ProfileSwitcher name={me.display_name ?? ""} />
      </div>

      <Card>
        <MonthSwitcher month={month} />
        <div className="mt-3 border-t border-border pt-3">
          <SeedFixedCostsButton month={month} />
        </div>
      </Card>

      <Link href="/chores" className="block">
        <Card className="flex items-center justify-between gap-3 transition-colors hover:bg-surface-muted">
          <div>
            <p className="font-medium text-ink">{content.dashboard.choresLinkTitle}</p>
            <p className="text-sm text-ink-muted">{content.dashboard.choresLinkHelp}</p>
          </div>
          <span className="shrink-0 text-sm font-medium text-primary">
            {content.dashboard.choresLinkCta}
          </span>
        </Card>
      </Link>

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
              <p className="text-sm text-ink-muted mb-3">
                {iAmRentHolder
                  ? content.profiles.reclaimHelp
                  : content.profiles.yourTransferHelp}
              </p>
              <div className="flex items-baseline justify-between">
                <span className="text-ink font-medium">
                  {iAmRentHolder ? `${partnerName}'s share` : me.display_name}
                </span>
                <Money value={formatMoney(balance)} className="text-3xl font-bold" />
              </div>
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
            <p className="text-sm text-positive">
              {iAmRentHolder
                ? content.profiles.allSettled
                : content.profiles.depositNothing}
            </p>
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
                {content.dashboard.fairShareLabel}
              </span>
              <Money value={formatMoney(summary.fairShare)} />
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
