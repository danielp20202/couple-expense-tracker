"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { content } from "@/content";
import type { ExpenseType, PaidFrom, Profile } from "@/lib/types";
import { createExpense } from "@/app/actions/expenses";
import { Button, Card, Input, Label, Select } from "@/app/components/ui";

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function ExpenseForm({
  types,
  personA,
  personB,
}: {
  types: ExpenseType[];
  personA: Profile;
  personB: Profile;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [typeId, setTypeId] = useState(types[0]?.id ?? "");
  const [paidBy, setPaidBy] = useState(personA.id);
  const [paidFrom, setPaidFrom] = useState<PaidFrom>("personal");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");

  if (types.length === 0) {
    return (
      <Card>
        <p className="text-sm text-ink-muted">{content.expenseForm.noTypes}</p>
      </Card>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const value = Number(amount);
    if (!value || value <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    startTransition(async () => {
      const res = await createExpense({
        amount: value,
        expense_type_id: typeId,
        paid_by: paidBy,
        paid_from: paidFrom,
        date,
        note: note.trim() || null,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setMessage(content.expenseForm.success);
      setAmount("");
      setNote("");
      router.refresh();
    });
  }

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="amount">{content.expenseForm.amount}</Label>
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="type">{content.expenseForm.type}</Label>
          <Select
            id="type"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
          >
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="paidBy">{content.expenseForm.paidBy}</Label>
            <Select
              id="paidBy"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
            >
              <option value={personA.id}>{personA.display_name}</option>
              <option value={personB.id}>{personB.display_name}</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="paidFrom">{content.expenseForm.paidFrom}</Label>
            <Select
              id="paidFrom"
              value={paidFrom}
              onChange={(e) => setPaidFrom(e.target.value as PaidFrom)}
            >
              <option value="personal">
                {content.expenseForm.paidFromPersonal}
              </option>
              <option value="joint">{content.expenseForm.paidFromJoint}</option>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="date">{content.expenseForm.date}</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="note">{content.expenseForm.note}</Label>
          <Input
            id="note"
            type="text"
            placeholder={content.expenseForm.notePlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-negative">{error}</p>}
        {message && <p className="text-sm text-positive">{message}</p>}

        <Button type="submit" disabled={pending}>
          {pending ? content.expenseForm.saving : content.expenseForm.submit}
        </Button>
      </form>
    </Card>
  );
}
