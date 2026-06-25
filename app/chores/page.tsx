import Link from "next/link";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getCouple } from "@/lib/profiles";
import { getSelectedProfileId } from "@/lib/profile-session";
import { normalizeWeek, weekDays } from "@/lib/week";
import { occurrencesForWeek } from "@/lib/chores";
import { content } from "@/content";
import type { Chore, ChoreCompletion } from "@/lib/types";
import { SectionTitle } from "@/app/components/ui";
import { SetupNotice } from "@/app/components/SetupNotice";
import { WeekSwitcher } from "@/app/components/WeekSwitcher";
import { ChoreWeekView } from "./ChoreWeekView";

export const dynamic = "force-dynamic";

export default async function ChoresPage({
  searchParams,
}: {
  searchParams: { week?: string };
}) {
  const selectedId = getSelectedProfileId();
  if (!selectedId) redirect("/select");

  const couple = await getCouple();
  if (!couple) {
    return (
      <div className="space-y-4">
        <SectionTitle>{content.chores.title}</SectionTitle>
        <SetupNotice />
      </div>
    );
  }

  const { personA, personB } = couple;
  if (![personA.id, personB.id].includes(selectedId)) redirect("/select");

  const week = normalizeWeek(searchParams.week);
  const days = weekDays(week);
  const start = days[0];
  const end = days[days.length - 1];

  // Active chores + completions whose occurrence date falls in the shown week.
  const [choreRows, completionRows] = await Promise.all([
    sql`select * from chores where active = true order by created_at asc`,
    sql`
      select * from chore_completions
      where completed_on >= ${start} and completed_on <= ${end}
    `,
  ]);

  const chores = choreRows as Chore[];
  const completions = completionRows as ChoreCompletion[];
  const occurrences = occurrencesForWeek(chores, days, completions);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle>{content.chores.title}</SectionTitle>
        <Link
          href="/chores/manage"
          className="whitespace-nowrap rounded-pill border border-border px-4 py-2 text-sm font-medium text-ink-muted hover:bg-surface-muted transition-colors"
        >
          {content.chores.manageLink}
        </Link>
      </div>

      <p className="text-sm text-ink-muted">{content.chores.weekHelp}</p>

      <ChoreWeekView
        week={week}
        days={days}
        occurrences={occurrences}
        personA={personA}
        personB={personB}
        selectedId={selectedId}
      />
    </div>
  );
}
