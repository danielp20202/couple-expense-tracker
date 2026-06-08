import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getCouple } from "@/lib/profiles";
import { computeMonthlySummary } from "@/lib/calc";
import { normalizeMonth, monthBounds } from "@/lib/month";
import { getSelectedProfileId } from "@/lib/profile-session";
import { formatMoney } from "@/lib/format";
import { content } from "@/content";
import type { Expense } from "@/lib/types";
import { Card, Money, SectionTitle } from "@/app/components/ui";
import { MonthSwitcher } from "@/app/components/MonthSwitcher";
import { SeedFixedCostsButton } from "@/app/components/SeedFixedCostsButton";
import { ProfileSwitcher } from "@/app/components/ProfileSwitcher";
import { SetupNotice } from "@/app/components/SetupNotice";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  // Require a selected profile; the dashboard is shown from "your" perspective.
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

  // Resolve "me" / "partner" from the selected profile. Stale cookie → re-pick.
  const me = [personA, personB].find((p) => p.id === selectedId);
  if (!me) redirect("/select");
  const partner = personA.id === selectedId ? personB : personA;

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

  const mine = summary.people.find((p) => p.profile.id === selectedId)!;
  const theirs = summary.people.find((p) => p.profile.id !== selectedId)!;

  // Is the selected profile the rent holder — the person who pays the joint rent
  // and receives the partner's share? They get a "contribution to rent" framing;
  // the other person gets the "transfer to the joint account" framing.
  const { data: jointRec } = await supabase
    .from("recurring_expenses")
    .select("paid_by")
    .eq("paid_from", "joint");
  const iAmRentHolder = (jointRec ?? []).some((r) => r.paid_by === selectedId);

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

      {!hasExpenses ? (
        <Card>
          <p className="text-ink-muted text-sm">
            {content.dashboard.nothingThisMonth}
          </p>
        </Card>
      ) : (
        <>
          {/* Personalized headline. Rent holder (e.g. Laura) sees her contribution
              plus the partner's share to move back; everyone else sees their deposit. */}
          {iAmRentHolder ? (
            <Card>
              <SectionTitle>{content.profiles.rentContributionTitle}</SectionTitle>
              <div className="flex items-baseline justify-between">
                <span className="text-ink font-medium">
                  {content.profiles.rentYourShareLabel}
                </span>
                <Money
                  value={formatMoney(mine.transferToJoint)}
                  className="text-3xl font-bold"
                />
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-ink-muted text-sm">
                    {content.profiles.rentPartnerShareLabel(partner.display_name ?? "")}
                  </span>
                  <Money
                    value={formatMoney(theirs.transferToJoint)}
                    className="font-semibold"
                  />
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  {content.profiles.rentTransferInstruction}
                </p>
              </div>
            </Card>
          ) : (
            <Card>
              <SectionTitle>{content.profiles.yourTransferTitle}</SectionTitle>
              <p className="text-sm text-ink-muted mb-3">
                {content.profiles.yourTransferHelp(partner.display_name ?? "")}
              </p>
              <div className="flex items-baseline justify-between">
                <span className="text-ink font-medium">
                  {me.display_name}{" "}
                  <span className="text-ink-muted text-xs">
                    ({content.profiles.youTag})
                  </span>
                </span>
                <Money
                  value={formatMoney(mine.transferToJoint)}
                  className="text-3xl font-bold"
                />
              </div>
            </Card>
          )}

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
      )}
    </div>
  );
}
