import { sql } from "@/lib/db";
import { getCouple } from "@/lib/profiles";
import { content } from "@/content";
import type { ExpenseType } from "@/lib/types";
import { SectionTitle } from "@/app/components/ui";
import { TypesManager } from "./TypesManager";

export const dynamic = "force-dynamic";

export default async function ExpenseTypesPage() {
  const couple = await getCouple();
  const types = (await sql`
    select * from expense_types order by name asc
  `) as ExpenseType[];

  return (
    <div className="space-y-5">
      <SectionTitle>{content.types.title}</SectionTitle>
      <p className="text-sm text-ink-muted">{content.types.help}</p>
      <TypesManager types={types} createdBy={couple?.personA.id ?? null} />
    </div>
  );
}
