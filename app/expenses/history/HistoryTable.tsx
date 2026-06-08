"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { content } from "@/content";
import type {
  ExpenseType,
  ExpenseWithType,
  PaidFrom,
  Profile,
} from "@/lib/types";
import {
  deleteExpense,
  deleteExpenses,
  updateExpense,
} from "@/app/actions/expenses";
import { formatMoney, formatDateShort } from "@/lib/format";
import { Button, Card, Input, Money, Select } from "@/app/components/ui";

export function HistoryTable({
  expenses,
  types,
  personA,
  personB,
}: {
  expenses: ExpenseWithType[];
  types: ExpenseType[];
  personA: Profile;
  personB: Profile;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const nameFor = (id: string) =>
    id === personA.id
      ? personA.display_name
      : id === personB.id
        ? personB.display_name
        : "—";

  const allIds = useMemo(() => expenses.map((e) => e.id), [expenses]);
  const allSelected = allIds.length > 0 && selected.size === allIds.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  function bulkDelete() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(content.history.confirmDeleteSelected(ids.length))) return;
    startTransition(async () => {
      setError(null);
      const res = await deleteExpenses(ids);
      if (res.error) {
        setError(res.error);
        return;
      }
      setSelected(new Set());
      router.refresh();
    });
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <p className="text-sm text-ink-muted">{content.history.empty}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selection / bulk-delete bar */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={allSelected}
            onChange={toggleAll}
          />
          {content.history.selectAll}
        </label>
        {selected.size > 0 && (
          <>
            <span className="text-sm text-ink-muted">
              {content.history.selectedCount(selected.size)}
            </span>
            <Button variant="danger" disabled={pending} onClick={bulkDelete}>
              {content.history.deleteSelected}
            </Button>
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() => setSelected(new Set())}
            >
              {content.history.clearSelection}
            </Button>
          </>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        {error && <p className="text-sm text-negative px-4 pt-3">{error}</p>}
        <ul className="divide-y divide-border">
          {expenses.map((e) =>
            editingId === e.id ? (
              <EditRow
                key={e.id}
                expense={e}
                types={types}
                personA={personA}
                personB={personB}
                pending={pending}
                onCancel={() => setEditingId(null)}
                onSave={(input) =>
                  startTransition(async () => {
                    setError(null);
                    const res = await updateExpense(e.id, input);
                    if (res.error) {
                      setError(res.error);
                      return;
                    }
                    setEditingId(null);
                    router.refresh();
                  })
                }
              />
            ) : (
              <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 accent-primary"
                  checked={selected.has(e.id)}
                  onChange={() => toggle(e.id)}
                  aria-label="Select entry"
                />
                <div className="w-14 shrink-0 text-sm text-ink-muted">
                  {formatDateShort(e.date)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-ink font-medium">
                    {e.expense_type?.name ?? "—"}
                  </div>
                  <div className="truncate text-xs text-ink-muted">
                    {nameFor(e.paid_by)} ·{" "}
                    {e.paid_from === "joint"
                      ? content.expenseForm.paidFromJoint
                      : content.expenseForm.paidFromPersonal}
                    {e.note ? ` · ${e.note}` : ""}
                  </div>
                </div>
                <Money value={formatMoney(Number(e.amount))} className="shrink-0" />
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" onClick={() => setEditingId(e.id)}>
                    {content.history.edit}
                  </Button>
                  <Button
                    variant="danger"
                    disabled={pending}
                    onClick={() => {
                      if (!confirm(content.history.confirmDelete)) return;
                      startTransition(async () => {
                        setError(null);
                        const res = await deleteExpense(e.id);
                        if (res.error) {
                          setError(res.error);
                          return;
                        }
                        router.refresh();
                      });
                    }}
                  >
                    {content.history.delete}
                  </Button>
                </div>
              </li>
            )
          )}
        </ul>
      </Card>
    </div>
  );
}

function EditRow({
  expense,
  types,
  personA,
  personB,
  pending,
  onSave,
  onCancel,
}: {
  expense: ExpenseWithType;
  types: ExpenseType[];
  personA: Profile;
  personB: Profile;
  pending: boolean;
  onSave: (input: {
    amount: number;
    expense_type_id: string;
    paid_by: string;
    paid_from: PaidFrom;
    date: string;
    note: string | null;
  }) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState(String(expense.amount));
  const [typeId, setTypeId] = useState(expense.expense_type_id ?? types[0]?.id ?? "");
  const [paidBy, setPaidBy] = useState(expense.paid_by);
  const [paidFrom, setPaidFrom] = useState<PaidFrom>(expense.paid_from);
  const [date, setDate] = useState(expense.date);
  const [note, setNote] = useState(expense.note ?? "");

  return (
    <li className="space-y-3 bg-surface-muted px-4 py-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Select value={typeId} onChange={(e) => setTypeId(e.target.value)}>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
        <Select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
          <option value={personA.id}>{personA.display_name}</option>
          <option value={personB.id}>{personB.display_name}</option>
        </Select>
        <Select
          value={paidFrom}
          onChange={(e) => setPaidFrom(e.target.value as PaidFrom)}
        >
          <option value="personal">{content.expenseForm.paidFromPersonal}</option>
          <option value="joint">{content.expenseForm.paidFromJoint}</option>
        </Select>
        <Input
          type="text"
          placeholder={content.expenseForm.notePlaceholder}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          disabled={pending}
          onClick={() =>
            onSave({
              amount: Number(amount),
              expense_type_id: typeId,
              paid_by: paidBy,
              paid_from: paidFrom,
              date,
              note: note.trim() || null,
            })
          }
        >
          {content.history.save}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          {content.history.cancel}
        </Button>
      </div>
    </li>
  );
}
