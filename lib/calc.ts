import type { Expense, Profile } from "@/lib/types";

/**
 * The 50/50 settlement math.
 *
 * Rules:
 *  - Every expense is split 50/50, so each person's fair share of the month's
 *    total is total / 2.
 *  - Expenses paid "personally" count toward that person having already paid.
 *  - Expenses paid from the "joint" account are funded by the joint account
 *    itself (i.e. by both people's transfers), so they aren't credited to
 *    either individual.
 *
 * For each person:
 *    transferToJoint = fairShare - amountPaidPersonally
 *
 * That can come out negative, which means the person already overpaid their
 * half. In that case we resolve it as a direct payment from the other person,
 * so the displayed joint transfers are never negative:
 *
 *    transferA + transferB === total of joint-paid expenses   (always)
 *
 * which is exactly the amount the joint account needs replenished.
 */

export interface PersonSummary {
  profile: Profile;
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
  fairShare: number;
  people: [PersonSummary, PersonSummary];
  direct: DirectSettlement | null;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function computeMonthlySummary(
  expenses: Expense[],
  personA: Profile,
  personB: Profile
): MonthlySummary {
  const total = round2(expenses.reduce((sum, e) => sum + Number(e.amount), 0));
  const fairShare = round2(total / 2);

  const paidPersonally = (personId: string) =>
    round2(
      expenses
        .filter((e) => e.paid_from === "personal" && e.paid_by === personId)
        .reduce((sum, e) => sum + Number(e.amount), 0)
    );

  const paidA = paidPersonally(personA.id);
  const paidB = paidPersonally(personB.id);

  // Raw transfers (may be negative if a person overpaid their half personally).
  const rawA = round2(fairShare - paidA);
  const rawB = round2(fairShare - paidB);

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
    fairShare,
    people: [
      { profile: personA, paidPersonally: paidA, transferToJoint: transferA },
      { profile: personB, paidPersonally: paidB, transferToJoint: transferB },
    ],
    direct,
  };
}
