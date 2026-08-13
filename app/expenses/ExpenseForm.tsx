"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { content } from "@/content";
import { clsx } from "@/lib/clsx";
import type { ExpenseType, PaidFrom, Profile } from "@/lib/types";
import { createExpense } from "@/app/actions/expenses";
import { Button, Card, Chip, Input, Label } from "@/app/components/ui";
import { SplitPicker } from "@/app/components/SplitPicker";

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Two-option segmented toggle — replaces a <select> for a binary choice. */
function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-control border border-border overflow-hidden">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={clsx(
            "flex-1 min-h-[40px] px-2 text-sm transition-colors",
            i > 0 && "border-l border-border",
            opt.value === value
              ? "bg-primary text-ink-inverse font-semibold"
              : "text-ink-muted hover:bg-surface-muted"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
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
  const [splitPctA, setSplitPctA] = useState(50);
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
        split_profile_id: personA.id,
        split_pct: splitPctA,
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
      setSplitPctA(50);
      router.refresh();
    });
  }

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <Label htmlFor="amount">{content.expenseForm.amount}</Label>
          <div className="flex items-baseline gap-1 border-b border-ink pb-2">
            <span className="font-serif text-2xl text-ink-muted">$</span>
            <input
              id="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full border-none bg-transparent font-serif text-[32px] font-semibold text-ink tabular-nums outline-none"
            />
          </div>
        </div>

        <div>
          <Label>{content.expenseForm.type}</Label>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <Chip key={t.id} active={t.id === typeId} onClick={() => setTypeId(t.id)}>
                {t.name}
              </Chip>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{content.expenseForm.paidBy}</Label>
            <Segmented
              value={paidBy}
              onChange={setPaidBy}
              options={[
                { value: personA.id, label: personA.display_name ?? "" },
                { value: personB.id, label: personB.display_name ?? "" },
              ]}
            />
          </div>
          <div>
            <Label>{content.expenseForm.paidFrom}</Label>
            <Segmented<PaidFrom>
              value={paidFrom}
              onChange={setPaidFrom}
              options={[
                { value: "personal", label: content.expenseForm.paidFromPersonal },
                { value: "joint", label: content.expenseForm.paidFromJoint },
              ]}
            />
          </div>
        </div>

        <SplitPicker
          personA={personA}
          personB={personB}
          pctA={splitPctA}
          onChange={setSplitPctA}
          idPrefix="exp"
        />

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

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? content.expenseForm.saving : content.expenseForm.submit}
        </Button>
      </form>
    </Card>
  );
}
