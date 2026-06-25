"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { content } from "@/content";
import { clsx } from "@/lib/clsx";
import type { Chore, ChoreRecurrence, Profile } from "@/lib/types";
import {
  createChore,
  deleteChore,
  setChoreActive,
  updateChore,
  type ChoreInput,
} from "@/app/actions/chores";
import { Button, Card, Label, Input, Select } from "@/app/components/ui";

interface Props {
  chores: Chore[];
  personA: Profile;
  personB: Profile;
}

const fieldClasses =
  "w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40";

// Display weekdays Mon–Sun, but store JS getDay() values (0=Sun..6=Sat).
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function ChoresManager({ chores, personA, personB }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const people = [personA, personB];
  const nameOf = (id: string | null) =>
    (id && people.find((p) => p.id === id)?.display_name) || content.chores.unassigned;

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

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-semibold text-ink mb-3">{content.chores.addTitle}</p>
        <ChoreFields
          people={people}
          pending={pending}
          submitLabel={content.chores.add}
          onSubmit={(input, reset) => run(() => createChore(input), reset)}
        />
      </Card>

      {error && <p className="text-sm text-negative">{error}</p>}

      {chores.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-muted">{content.chores.empty}</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <ul className="divide-y divide-border">
            {chores.map((c) =>
              editingId === c.id ? (
                <li key={c.id} className="px-4 py-4">
                  <ChoreFields
                    people={people}
                    pending={pending}
                    submitLabel={content.chores.save}
                    initial={c}
                    onCancel={() => setEditingId(null)}
                    onSubmit={(input) =>
                      run(() => updateChore(c.id, input), () => setEditingId(null))
                    }
                  />
                </li>
              ) : (
                <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          c.active ? "text-ink font-medium" : "text-ink-muted line-through"
                        }
                      >
                        {c.name}
                      </span>
                      {!c.active && (
                        <span className="text-xs text-ink-muted">{content.chores.paused}</span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted">
                      {nameOf(c.assigned_to)} ·{" "}
                      {content.chores.recurrenceSummary(
                        c.recurrence,
                        c.weekdays.map((w) => content.chores.weekdayShort[w]),
                        c.day_of_month
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" onClick={() => setEditingId(c.id)}>
                      {content.chores.edit}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={pending}
                      onClick={() => run(() => setChoreActive(c.id, !c.active))}
                    >
                      {c.active ? content.chores.pause : content.chores.resume}
                    </Button>
                    <Button
                      variant="danger"
                      disabled={pending}
                      onClick={() => {
                        if (!confirm(content.chores.confirmDelete)) return;
                        run(() => deleteChore(c.id));
                      }}
                    >
                      {content.chores.delete}
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

/** Shared add/edit field set for a chore. */
function ChoreFields({
  people,
  pending,
  submitLabel,
  initial,
  onSubmit,
  onCancel,
}: {
  people: Profile[];
  pending: boolean;
  submitLabel: string;
  initial?: Chore;
  onSubmit: (input: ChoreInput, reset: () => void) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [assignedTo, setAssignedTo] = useState<string>(initial?.assigned_to ?? "");
  const [recurrence, setRecurrence] = useState<ChoreRecurrence>(initial?.recurrence ?? "weekly");
  const [weekdays, setWeekdays] = useState<number[]>(initial?.weekdays ?? []);
  const [dayOfMonth, setDayOfMonth] = useState<string>(
    initial?.day_of_month != null ? String(initial.day_of_month) : ""
  );
  const [startDate, setStartDate] = useState(initial?.start_date ?? todayISO());
  const [localError, setLocalError] = useState<string | null>(null);

  function reset() {
    setName("");
    setAssignedTo("");
    setRecurrence("weekly");
    setWeekdays([]);
    setDayOfMonth("");
    setStartDate(todayISO());
  }

  function toggleWeekday(w: number) {
    setWeekdays((prev) =>
      prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w].sort((a, b) => a - b)
    );
  }

  function submit() {
    if (!name.trim()) {
      setLocalError("Give the chore a name.");
      return;
    }
    if (recurrence === "weekly" && weekdays.length === 0) {
      setLocalError("Pick at least one weekday.");
      return;
    }
    const dom = dayOfMonth ? Number(dayOfMonth) : null;
    if (recurrence === "monthly" && (!dom || dom < 1 || dom > 31)) {
      setLocalError("Pick a day of the month (1–31).");
      return;
    }
    setLocalError(null);
    onSubmit(
      {
        name: name.trim(),
        assigned_to: assignedTo || null,
        recurrence,
        weekdays,
        day_of_month: dom,
        start_date: startDate,
      },
      reset
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="chore-name">{content.chores.name}</Label>
        <Input
          id="chore-name"
          value={name}
          placeholder={content.chores.namePlaceholder}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="chore-assignee">{content.chores.assignedTo}</Label>
          <Select
            id="chore-assignee"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">{content.chores.unassigned}</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.display_name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="chore-recurrence">{content.chores.recurrence}</Label>
          <Select
            id="chore-recurrence"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as ChoreRecurrence)}
          >
            {(["once", "daily", "weekly", "monthly"] as const).map((r) => (
              <option key={r} value={r}>
                {content.chores.recurrenceLabels[r]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {recurrence === "weekly" && (
        <div>
          <Label>{content.chores.weekdays}</Label>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAY_ORDER.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => toggleWeekday(w)}
                className={clsx(
                  "rounded-pill px-3 py-1.5 text-sm font-medium transition-colors",
                  weekdays.includes(w)
                    ? "bg-primary text-ink-inverse"
                    : "border border-border text-ink-muted hover:bg-surface-muted"
                )}
              >
                {content.chores.weekdayShort[w]}
              </button>
            ))}
          </div>
        </div>
      )}

      {recurrence === "monthly" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="chore-dom">{content.chores.dayOfMonth}</Label>
            <Input
              id="chore-dom"
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="chore-start">{content.chores.startDate}</Label>
        <input
          id="chore-start"
          type="date"
          className={fieldClasses}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      {localError && <p className="text-sm text-negative">{localError}</p>}

      <div className="flex gap-2">
        <Button disabled={pending} onClick={submit}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            {content.chores.cancel}
          </Button>
        )}
      </div>
    </div>
  );
}
