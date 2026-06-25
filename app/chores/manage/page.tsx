import Link from "next/link";
import { sql } from "@/lib/db";
import { getCouple } from "@/lib/profiles";
import { content } from "@/content";
import type { Chore } from "@/lib/types";
import { SectionTitle } from "@/app/components/ui";
import { SetupNotice } from "@/app/components/SetupNotice";
import { ChoresManager } from "./ChoresManager";

export const dynamic = "force-dynamic";

export default async function ManageChoresPage() {
  const couple = await getCouple();
  if (!couple) {
    return (
      <div className="space-y-4">
        <SectionTitle>{content.chores.manageTitle}</SectionTitle>
        <SetupNotice />
      </div>
    );
  }

  const choreRows = await sql`select * from chores order by created_at asc`;
  const chores = choreRows as Chore[];

  return (
    <div className="space-y-5">
      <Link href="/chores" className="text-sm text-ink-muted hover:text-primary transition-colors">
        {content.chores.backToWeek}
      </Link>
      <SectionTitle>{content.chores.manageTitle}</SectionTitle>
      <p className="text-sm text-ink-muted">{content.chores.manageHelp}</p>
      <ChoresManager chores={chores} personA={couple.personA} personB={couple.personB} />
    </div>
  );
}
