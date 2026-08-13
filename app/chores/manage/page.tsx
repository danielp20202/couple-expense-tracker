import Link from "next/link";
import { sql } from "@/lib/db";
import { getCouple } from "@/lib/profiles";
import { content } from "@/content";
import type { Chore } from "@/lib/types";
import { PageTitle } from "@/app/components/ui";
import { SetupNotice } from "@/app/components/SetupNotice";
import { ChoresManager } from "./ChoresManager";

export const dynamic = "force-dynamic";

export default async function ManageChoresPage() {
  const couple = await getCouple();
  if (!couple) {
    return (
      <div className="space-y-4">
        <PageTitle>{content.chores.manageTitle}</PageTitle>
        <SetupNotice />
      </div>
    );
  }

  const choreRows = await sql`select * from chores order by created_at asc`;
  const chores = choreRows as Chore[];

  return (
    <div className="space-y-5">
      <Link href="/chores" className="font-mono text-xs uppercase tracking-wide text-ink-muted hover:text-ink transition-colors">
        {content.chores.backToWeek}
      </Link>
      <PageTitle>{content.chores.manageTitle}</PageTitle>
      <p className="text-sm text-ink-muted">{content.chores.manageHelp}</p>
      <ChoresManager chores={chores} personA={couple.personA} personB={couple.personB} />
    </div>
  );
}
