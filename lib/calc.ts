import type { Expense, Profile } from "@/lib/types";

/**
 * The settlement math.
 *
 * Rules:
 *  - Each expense is split per its own percentage: `split_pct`% of the amount
 *    is `split_profile_id`'s share and the partner bears the rest. A null
 *    anchor means 50/50 (the default, and all legacy rows). A person's share
 *    of the month is the sum of their per-expense shares.
 *  - Expenses paid "personally" count toward that person having already paid.
 *  - Expenses paid from the "joint" account are funded by the joint account
 *    itself (i.e. by both people's transfers), so they aren't credited to
 *    either individual.
 *
 * For each person:
 *    transferToJoint = share - amountPaidPersonally
 *
 * That can come out negative, which means the person already overpaid their
 * share. In that case we resolve it as a direct payment from the other person,
 * so the displayed joint transfers are never negative:
 *
 *    transferA + transferB === total of joint-paid expenses   (always)
 *
 * (shareA + shareB = total for any splits, so the identity still holds.)
 */

export interface PersonSummary {
  profile: Profile;
  /** This person's share of the month's expenses (sum of per-expense splits). */
  share: number;
  paidPersonally: number;
  /** Non-negative amount this person should move into the joint account. */
  transferToJoint: number;
}

export interface DirectSettlement {
  from: Profile; // owes
  to: Profile; // is owed
  amount: number;
}

export interface MonthlySummary {
  total: number;
  people: [PersonSummary, PersonSummary];
  direct: DirectSettlement | null;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Minimal shape needed for share math (works for any row source). */
export interface BalanceExpense {
  amount: number;
  paid_from: "personal" | "joint";
  paid_by: string;
  split_profile_id: string | null;
  split_pct: number;
}

/**
 * `personId`'s share of one expense per its split. A null anchor means 50/50;
 * otherwise the anchor bears split_pct% and the partner the remainder.
 */
export function shareFor(
  e: Pick<BalanceExpense, "amount" | "split_profile_id" | "split_pct">,
  personId: string
): number {
  const amount = Number(e.amount);
  if (!e.split_profile_id) return amount / 2;
  const pct = Number(e.split_pct);
  return e.split_profile_id === personId
    ? (amount * pct) / 100
    : (amount * (100 - pct)) / 100;
}

/**
 * The cumulative "settlement balance" the dashboard shows, carried across months.
 *
 *   balance = (depositor's share of all expenses) − (depositor's personal-paid) − (settlements)
 *
 * `depositorId` is the partner who deposits into the joint account (e.g. Daniel —
 * the non-rent-holder). Pass *all* expenses and settlements dated up to and
 * including the viewed month (carry-over is automatic since we just sum).
 *
 * Positive → depositor still owes this much (deposit / the rent holder reclaims).
 * Negative → depositor has covered extra; it rolls into the next rent transfer.
 */
export function computeSettlementBalance(
  expenses: BalanceExpense[],
  depositorId: string,
  settlements: { amount: number }[]
): number {
  const depositorShare = expenses.reduce((s, e) => s + shareFor(e, depositorId), 0);
  const depositorPersonal = expenses
    .filter((e) => e.paid_from === "personal" && e.paid_by === depositorId)
    .reduce((s, e) => s + Number(e.amount), 0);
  const settled = settlements.reduce((s, x) => s + Number(x.amount), 0);
  return round2(depositorShare - depositorPersonal - settled);
}

export function computeMonthlySummary(
  expenses: Expense[],
  personA: Profile,
  personB: Profile
): MonthlySummary {
  const total = round2(expenses.reduce((sum, e) => sum + Number(e.amount), 0));

  const shareOf = (personId: string) =>
    round2(expenses.reduce((sum, e) => sum + shareFor(e, personId), 0));

  const paidPersonally = (personId: string) =>
    round2(
      expenses
        .filter((e) => e.paid_from === "personal" && e.paid_by === personId)
        .reduce((sum, e) => sum + Number(e.amount), 0)
    );

  const shareA = shareOf(personA.id);
  const shareB = shareOf(personB.id);
  const paidA = paidPersonally(personA.id);
  const paidB = paidPersonally(personB.id);

  // Raw transfers (may be negative if a person overpaid their share personally).
  const rawA = round2(shareA - paidA);
  const rawB = round2(shareB - paidB);

  let transferA = rawA;
  let transferB = rawB;
  let direct: DirectSettlement | null = null;

  if (rawA < 0) {
    // A overpaid: B reimburses A directly, A transfers nothing to joint.
    direct = { from: personB, to: personA, amount: round2(-rawA) };
    transferA = 0;
    transferB = round2(rawA + rawB); // = joint-paid total
  } else if (rawB < 0) {
    direct = { from: personA, to: personB, amount: round2(-rawB) };
    transferB = 0;
    transferA = round2(rawA + rawB);
  }

  return {
    total,
    people: [
      { profile: personA, share: shareA, paidPersonally: paidA, transferToJoint: transferA },
      { profile: personB, share: shareB, paidPersonally: paidB, transferToJoint: transferB },
    ],
    direct,
  };
}
