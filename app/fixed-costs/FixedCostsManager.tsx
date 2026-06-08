"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { content } from "@/content";
import { formatMoney } from "@/lib/format";
import type {
  ExpenseType,
  PaidFrom,
  Profile,
  RecurringExpenseWithType,
} from "@/lib/types";
import {
  createRecurring,
  deleteRecurring,
  setRecurringActive,
  updateRecurring,
  type RecurringInput,
} from "@/app/actions/recurring";
import { Button, Card, Label, Money, Select } from "@/app/components/ui";

interface Props {
  recurring: RecurringExpenseWithType[];
  types: ExpenseType[];
  personA: Profile;
  personB: Profile;
}

const fieldClasses =
  "w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40";

export function FixedCostsManager({ recurring, types, personA, personB }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const people = [personA, personB];
  const nameOf = (id: string) =>
    people.find((p) => p.id === id)?.display_name ?? "—";

  function run(fn: () => Promise<{ error: string | null }>, after?: () => void) {
    startTransition(async () => {
      setError(null);
      const res = await fn();
      if (res.error) {
        setError(res.error);
        return;
      }
      after?.();
      router.refresh();
    });
  }

  if (types.length === 0) {
    return (
      <Card>
        <p className="text-sm text-ink-muted">{content.fixedCosts.noTypes}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <SectionLabel>{content.fixedCosts.addTitle}</SectionLabel>
        <RecurringFields
          types={types}
          people={people}
          pending={pending}
          submitLabel={content.fixedCosts.add}
          onSubmit={(input, reset) =>
            run(() => createRecurring(input), reset)
          }
        />
      </Card>

      {error && <p className="text-sm text-negative">{error}</p>}

      {recurring.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-muted">{content.fixedCosts.empty}</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <ul className="divide-y divide-border">
            {recurring.map((r) =>
              editingId === r.id ? (
                <li key={r.id} className="px-4 py-4">
                  <RecurringFields
                    types={types}
                    people={people}
                    pending={pending}
                    submitLabel={content.fixedCosts.save}
                    initial={{
                      amount: String(r.amount),
                      expense_type_id: r.expense_type_id ?? types[0]?.id ?? "",
                      paid_by: r.paid_by,
                      paid_from: r.paid_from,
                    }}
                    onCancel={() => setEditingId(null)}
                    onSubmit={(input) =>
                      run(() => updateRecurring(r.id, input), () =>
                        setEditingId(null)
                      )
                    }
                  />
                </li>
              ) : (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          r.active ? "text-ink font-medium" : "text-ink-muted line-through"
                        }
                      >
                        {r.expense_type?.name ?? "—"}
                      </span>
                      {!r.active && (
                        <span className="text-xs text-ink-muted">
                          {content.fixedCosts.paused}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted">
                      {nameOf(r.paid_by)} ·{" "}
                      {r.paid_from === "joint"
                        ? content.fixedCosts.joint
                        : content.fixedCosts.personal}
                    </p>
                  </div>
                  <Money value={formatMoney(Number(r.amount))} className="font-semibold" />
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      onClick={() => setEditingId(r.id)}
                    >
                      {content.fixedCosts.edit}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={pending}
                      onClick={() => run(() => setRecurringActive(r.id, !r.active))}
                    >
                      {r.active ? content.fixedCosts.pause : content.fixedCosts.resume}
                    </Button>
                    <Button
                      variant="danger"
                      disabled={pending}
                      onClick={() => {
                        if (!confirm(content.fixedCosts.confirmDelete)) return;
                        run(() => deleteRecurring(r.id));
                      }}
                    >
                      {content.fixedCosts.delete}
                    </Button>
                  </div>
                </li>
              )
            )}
          </ul>
        </Card>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold text-ink mb-3">{children}</p>;
}

/** Shared add/edit field set for a recurring fixed cost. */
function RecurringFields({
  types,
  people,
  pending,
  submitLabel,
  initial,
  onSubmit,
  onCancel,
}: {
  types: ExpenseType[];
  people: Profile[];
  pending: boolean;
  submitLabel: string;
  initial?: {
    amount: string;
    expense_type_id: string;
    paid_by: string;
    paid_from: PaidFrom;
  };
  onSubmit: (input: RecurringInput, reset: () => void) => void;
  onCancel?: () => void;
}) {
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [typeId, setTypeId] = useState(
    initial?.expense_type_id ?? types[0]?.id ?? ""
  );
  const [paidBy, setPaidBy] = useState(initial?.paid_by ?? people[0]?.id ?? "");
  const [paidFrom, setPaidFrom] = useState<PaidFrom>(
    initial?.paid_from ?? "personal"
  );
  const [localError, setLocalError] = useState<string | null>(null);

  function reset() {
    setAmount("");
    setTypeId(types[0]?.id ?? "");
    setPaidBy(people[0]?.id ?? "");
    setPaidFrom("personal");
  }

  function submit() {
    const value = Number(amount);
    if (!value || value <= 0) {
      setLocalError("Enter an amount greater than 0.");
      return;
    }
    setLocalError(null);
    onSubmit(
      {
        amount: value,
        expense_type_id: typeId,
        paid_by: paidBy,
        paid_from: paidFrom,
      },
      reset
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="fc-amount">{content.fixedCosts.amount}</Label>
          <input
            id="fc-amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            className={fieldClasses}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="fc-type">{content.fixedCosts.category}</Label>
          <Select
            id="fc-type"
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
        <div>
          <Label htmlFor="fc-paidby">{content.fixedCosts.paidBy}</Label>
          <Select
            id="fc-paidby"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          >
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display_name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="fc-paidfrom">{content.fixedCosts.paidFrom}</Label>
          <Select
            id="fc-paidfrom"
            value={paidFrom}
            onChange={(e) => setPaidFrom(e.target.value as PaidFrom)}
          >
            <option value="personal">{content.fixedCosts.personal}</option>
            <option value="joint">{content.fixedCosts.joint}</option>
          </Select>
        </div>
      </div>

      {localError && <p className="text-sm text-negative">{localError}</p>}

      <div className="flex gap-2">
        <Button disabled={pending} onClick={submit}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            {content.fixedCosts.cancel}
          </Button>
        )}
      </div>
    </div>
  );
}
