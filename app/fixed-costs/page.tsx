import { sql } from "@/lib/db";
import { getCouple } from "@/lib/profiles";
import { content } from "@/content";
import type { ExpenseType, RecurringExpenseWithType } from "@/lib/types";
import { SectionTitle } from "@/app/components/ui";
import { SetupNotice } from "@/app/components/SetupNotice";
import { FixedCostsManager } from "./FixedCostsManager";

export const dynamic = "force-dynamic";

export default async function FixedCostsPage() {
  const couple = await getCouple();
  if (!couple) {
    return (
      <div className="space-y-4">
        <SectionTitle>{content.fixedCosts.title}</SectionTitle>
        <SetupNotice />
      </div>
    );
  }

  const [typesData, recurringRows] = await Promise.all([
    sql`select * from expense_types order by name asc`,
    sql`
      select r.*, et.name as expense_type_name
      from recurring_expenses r
      left join expense_types et on et.id = r.expense_type_id
      order by r.created_at asc
    `,
  ]);

  const types = typesData as ExpenseType[];
  const recurring = (recurringRows as any[]).map((r) => ({
    ...r,
    expense_type: r.expense_type_name ? { name: r.expense_type_name } : null,
  })) as RecurringExpenseWithType[];

  return (
    <div className="space-y-5">
      <SectionTitle>{content.fixedCosts.title}</SectionTitle>
      <p className="text-sm text-ink-muted">{content.fixedCosts.help}</p>
      <FixedCostsManager
        recurring={recurring}
        types={types}
        personA={couple.personA}
        personB={couple.personB}
      />
    </div>
  );
}
