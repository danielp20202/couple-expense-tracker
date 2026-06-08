import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getCouple } from "@/lib/profiles";
import { computeMonthlySummary } from "@/lib/calc";
import { normalizeMonth, monthBounds } from "@/lib/month";
import { getSelectedProfileId } from "@/lib/profile-session";
import { formatMoney, formatDateShort } from "@/lib/format";
import { content } from "@/content";
import type { Expense } from "@/lib/types";
import { Card, Money, SectionTitle } from "@/app/components/ui";
import { MonthSwitcher } from "@/app/components/MonthSwitcher";
import { SeedFixedCostsButton } from "@/app/components/SeedFixedCostsButton";
import { ProfileSwitcher } from "@/app/components/ProfileSwitcher";
import { TransferDoneToggle } from "@/app/components/TransferDoneToggle";
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

  // The rent holder pays the joint rent and reclaims the partner's share from
  // the joint account. They get the "transfer back to your account" framing +
  // the done checkbox; the other person gets the "deposit" framing.
  const { data: jointRec } = await supabase
    .from("recurring_expenses")
    .select("paid_by")
    .eq("paid_from", "joint");
  const rentHolderId = (jointRec ?? []).map((r) => r.paid_by as string)[0] ?? null;
  const iAmRentHolder = rentHolderId === selectedId;

  // Shared status: has this month's reimbursement been transferred back yet?
  let transferDone = false;
  let transferDoneOn: string | null = null;
  if (rentHolderId) {
    const { data: st } = await supabase
      .from("transfer_status")
      .select("done, done_on")
      .eq("month", month)
      .eq("profile_id", rentHolderId)
      .maybeSingle();
    transferDone = st?.done ?? false;
    transferDoneOn = (st?.done_on as string | null) ?? null;
  }

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
          {/* Rent holder (e.g. Laura) reclaims the partner's share from the joint
              account and ticks it done; everyone else sees their deposit. */}
          {iAmRentHolder ? (
            <Card>
              <SectionTitle>{content.profiles.reclaimTitle}</SectionTitle>
              <p className="text-sm text-ink-muted mb-3">
                {content.profiles.reclaimHelp(partner.display_name ?? "")}
              </p>
              <div className="flex items-baseline justify-between">
                <span className="text-ink-muted text-sm">
                  {`${partner.display_name}'s share`}
                </span>
                <Money
                  value={formatMoney(theirs.transferToJoint)}
                  className="text-3xl font-bold"
                />
              </div>
              {rentHolderId && (
                <TransferDoneToggle
                  month={month}
                  profileId={rentHolderId}
                  done={transferDone}
                  doneOn={transferDoneOn}
                />
              )}
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
              {rentHolderId && (
                <p className="mt-3 border-t border-border pt-3 text-sm text-ink-muted">
                  {transferDone && transferDoneOn
                    ? content.profiles.partnerTransferredOn(
                        partner.display_name ?? "",
                        formatDateShort(transferDoneOn)
                      )
                    : content.profiles.partnerNotTransferred(partner.display_name ?? "")}
                </p>
              )}
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
