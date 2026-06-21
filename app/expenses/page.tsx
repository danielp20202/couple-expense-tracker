import { sql } from "@/lib/db";
import { getCouple } from "@/lib/profiles";
import { content } from "@/content";
import type { ExpenseType } from "@/lib/types";
import { SectionTitle } from "@/app/components/ui";
import { SetupNotice } from "@/app/components/SetupNotice";
import { ExpenseForm } from "./ExpenseForm";

export const dynamic = "force-dynamic";

export default async function AddExpensePage() {
  const couple = await getCouple();
  if (!couple) {
    return (
      <div className="space-y-4">
        <SectionTitle>{content.expenseForm.title}</SectionTitle>
        <SetupNotice />
      </div>
    );
  }

  const types = (await sql`
    select * from expense_types order by name asc
  `) as ExpenseType[];

  return (
    <div className="space-y-5">
      <SectionTitle>{content.expenseForm.title}</SectionTitle>
      <ExpenseForm
        types={types}
        personA={couple.personA}
        personB={couple.personB}
      />
    </div>
  );
}
