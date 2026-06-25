"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { content } from "@/content";
import { parseDate, currentWeekMonday } from "@/lib/week";
import { clsx } from "@/lib/clsx";
import type { ChoreOccurrence, ChoreRecurrence, Profile } from "@/lib/types";
import {
  createChore,
  setChoreAssignee,
  toggleChoreCompletion,
} from "@/app/actions/chores";
import { Button, Card, Input } from "@/app/components/ui";
import { Avatar } from "@/app/components/Avatar";
import { WeekSwitcher } from "@/app/components/WeekSwitcher";

interface Props {
  week: string;
  days: string[];
  occurrences: ChoreOccurrence[];
  personA: Profile;
  personB: Profile;
  selectedId: string;
}

type Filter = "everyone" | "mine";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function ChoreCalendar({
  week,
  days,
  occurrences,
  personA,
  personB,
  selectedId,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("everyone");
  const [assignMenu, setAssignMenu] = useState<string | null>(null); // occurrence key
  const [addDay, setAddDay] = useState<string | null>(null); // date for the add sheet

  const people = [personA, personB];
  const nameOf = (id: string | null) =>
    (id && people.find((p) => p.id === id)?.display_name) || content.chores.unassigned;
  const photoFor = (id: string | null) =>
    id ? content.profiles.photos[nameOf(id)] : undefined;

  const todayStr = currentWeekMonday() === week ? todayISO() : null;

  function run(action: () => Promise<{ error: string | null }>, key?: string) {
    setBusyKey(key ?? null);
    startTransition(async () => {
      await action();
      setBusyKey(null);
      setAssignMenu(null);
      router.refresh();
    });
  }

  const shown = useMemo(
    () =>
      filter === "mine"
        ? occurrences.filter((o) => o.chore.assigned_to === selectedId)
        : occurrences,
    [occurrences, filter, selectedId]
  );

  const byDay = useMemo(() => {
    const map = new Map<string, ChoreOccurrence[]>();
    for (const d of days) map.set(d, []);
    for (const o of shown) map.get(o.date)?.push(o);
    return map;
  }, [shown, days]);

  const empty = shown.length === 0;

  return (
    <div className="space-y-4">
      <Card>
        <WeekSwitcher week={week} />
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex gap-1">
            <FilterTab active={filter === "everyone"} onClick={() => setFilter("everyone")}>
              {content.chores.filterEveryone}
            </FilterTab>
            <FilterTab active={filter === "mine"} onClick={() => setFilter("mine")}>
              {content.chores.filterMine}
            </FilterTab>
          </div>
          <Button onClick={() => setAddDay(todayStr ?? days[0])}>
            + {content.chores.newChore}
          </Button>
        </div>
      </Card>

      {/* Week grid: stacked on mobile, 7 columns from md up (Google-Calendar-like). */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
        {days.map((date) => {
          const items = byDay.get(date) ?? [];
          const isToday = date === todayStr;
          const dow = content.chores.weekdayShort[parseDate(date).getDay()];
          const dayNum = Number(date.slice(8, 10));
          return (
            <div
              key={date}
              className={clsx(
                "flex flex-col rounded-card border bg-surface",
                isToday ? "border-primary" : "border-border"
              )}
            >
              <div
                className={clsx(
                  "flex items-baseline justify-between gap-1 rounded-t-card border-b px-3 py-2",
                  isToday
                    ? "border-primary bg-primary text-ink-inverse"
                    : "border-border bg-surface-muted/40"
                )}
              >
                <span className="text-xs font-semibold uppercase tracking-wide">{dow}</span>
                <span className={clsx("text-sm", isToday ? "font-bold" : "text-ink-muted")}>
                  {dayNum}
                </span>
              </div>

              <div className="flex-1 space-y-1.5 p-1.5">
                {items.length === 0 ? (
                  <p className="px-1 py-1 text-xs text-ink-muted/70">{content.chores.noneToday}</p>
                ) : (
                  items.map((o) => {
                    const key = `${o.chore.id}|${o.date}`;
                    const busy = busyKey === key && pending;
                    const aName = nameOf(o.chore.assigned_to);
                    return (
                      <div
                        key={key}
                        className={clsx(
                          "relative rounded-control border px-2 py-1.5",
                          o.done
                            ? "border-positive/30 bg-positive/10"
                            : "border-border bg-surface-muted/50"
                        )}
                      >
                        <div className="flex items-start gap-1.5">
                          <button
                            type="button"
                            aria-pressed={o.done}
                            aria-label={o.done ? content.chores.done : o.chore.name}
                            disabled={busy}
                            onClick={() => run(() => toggleChoreCompletion(o.chore.id, o.date, selectedId), key)}
                            className={clsx(
                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-50",
                              o.done
                                ? "border-positive bg-positive text-ink-inverse"
                                : "border-border hover:border-primary"
                            )}
                          >
                            {o.done && (
                              <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor">
                                <path
                                  fillRule="evenodd"
                                  d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => run(() => toggleChoreCompletion(o.chore.id, o.date, selectedId), key)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <span
                              className={clsx(
                                "block text-xs leading-snug",
                                o.done ? "text-ink-muted line-through" : "font-medium text-ink"
                              )}
                            >
                              {o.chore.name}
                            </span>
                          </button>

                          <button
                            type="button"
                            aria-label={`${content.chores.assignedTo}: ${aName}`}
                            onClick={() => setAssignMenu(assignMenu === key ? null : key)}
                            className="shrink-0 rounded-full ring-offset-1 hover:ring-2 hover:ring-primary/40"
                          >
                            <Avatar
                              name={aName}
                              size={20}
                              photoSrc={photoFor(o.chore.assigned_to)}
                              className={clsx(!o.chore.assigned_to && "opacity-40")}
                            />
                          </button>
                        </div>

                        {assignMenu === key && (
                          <div className="absolute right-1 top-full z-20 mt-1 w-40 overflow-hidden rounded-control border border-border bg-surface py-1 shadow-lg">
                            {[personA, personB, null].map((p) => {
                              const id = p ? p.id : null;
                              const label = p ? p.display_name ?? "" : content.chores.unassigned;
                              const active = (o.chore.assigned_to ?? null) === id;
                              return (
                                <button
                                  key={id ?? "none"}
                                  type="button"
                                  disabled={pending}
                                  onClick={() => run(() => setChoreAssignee(o.chore.id, id))}
                                  className={clsx(
                                    "flex w-full items-center gap-2 px-2.5 py-1.5 text-xs",
                                    active
                                      ? "bg-primary/10 font-medium text-primary"
                                      : "text-ink hover:bg-surface-muted"
                                  )}
                                >
                                  <Avatar
                                    name={label}
                                    size={18}
                                    photoSrc={photoFor(id)}
                                    className={clsx(!id && "opacity-40")}
                                  />
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <button
                type="button"
                onClick={() => setAddDay(date)}
                className="m-1.5 mt-0 rounded-control border border-dashed border-border py-1 text-xs font-medium text-ink-muted transition-colors hover:border-primary hover:text-primary"
              >
                +
              </button>
            </div>
          );
        })}
      </div>

      {empty && (
        <p className="text-center text-sm text-ink-muted">
          {filter === "mine" ? content.chores.emptyWeekMine : content.chores.reassignHint}
        </p>
      )}

      {/* Click-away layer for the assignee menu */}
      {assignMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setAssignMenu(null)} aria-hidden />
      )}

      {addDay && (
        <AddChoreSheet
          date={addDay}
          people={people}
          selectedId={selectedId}
          pending={pending}
          onClose={() => setAddDay(null)}
          onCreate={(input) =>
            run(async () => {
              const res = await createChore(input);
              if (!res.error) setAddDay(null);
              return res;
            })
          }
        />
      )}
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-pill px-4 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-primary text-ink-inverse" : "text-ink-muted hover:bg-surface-muted"
      )}
    >
      {children}
    </button>
  );
}

/** Bottom-sheet / modal to quickly add a chore on a given day. */
function AddChoreSheet({
  date,
  people,
  selectedId,
  pending,
  onClose,
  onCreate,
}: {
  date: string;
  people: Profile[];
  selectedId: string;
  pending: boolean;
  onClose: () => void;
  onCreate: (input: {
    name: string;
    assigned_to: string | null;
    recurrence: ChoreRecurrence;
    weekdays: number[];
    day_of_month: number | null;
    start_date: string;
  }) => void;
}) {
  const weekday = parseDate(date).getDay();
  const weekdayLong = content.chores.weekdayLong[weekday];
  const [name, setName] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>(selectedId);
  const [repeat, setRepeat] = useState<ChoreRecurrence>("weekly");
  const [error, setError] = useState<string | null>(null);

  const dateLabel = parseDate(date).toLocaleDateString(content.config.locale, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  function submit() {
    if (!name.trim()) {
      setError("Give the chore a name.");
      return;
    }
    setError(null);
    onCreate({
      name: name.trim(),
      assigned_to: assignedTo || null,
      recurrence: repeat,
      weekdays: repeat === "weekly" ? [weekday] : [],
      day_of_month: null,
      start_date: date,
    });
  }

  const repeatOptions: { value: ChoreRecurrence; label: string }[] = [
    { value: "weekly", label: content.chores.repeatEvery(weekdayLong) },
    { value: "once", label: content.chores.repeatOnce },
    { value: "daily", label: content.chores.repeatDaily },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-md rounded-t-card border border-border bg-surface p-5 shadow-xl sm:rounded-card">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">{content.chores.newChore}</h3>
          <span className="text-xs text-ink-muted">{dateLabel}</span>
        </div>

        <div className="space-y-3">
          <Input
            autoFocus
            value={name}
            placeholder={content.chores.namePlaceholder}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />

          {/* Who — quick chips */}
          <div>
            <p className="mb-1 text-xs font-medium text-ink-muted">{content.chores.assignedTo}</p>
            <div className="flex flex-wrap gap-1.5">
              {people.map((p) => (
                <Chip
                  key={p.id}
                  active={assignedTo === p.id}
                  onClick={() => setAssignedTo(p.id)}
                >
                  {p.display_name}
                  {p.id === selectedId ? ` (${content.chores.assignToYou})` : ""}
                </Chip>
              ))}
              <Chip active={assignedTo === ""} onClick={() => setAssignedTo("")}>
                {content.chores.unassigned}
              </Chip>
            </div>
          </div>

          {/* Repeat — quick chips */}
          <div>
            <p className="mb-1 text-xs font-medium text-ink-muted">{content.chores.repeatLabel}</p>
            <div className="flex flex-wrap gap-1.5">
              {repeatOptions.map((o) => (
                <Chip key={o.value} active={repeat === o.value} onClick={() => setRepeat(o.value)}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-negative">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button disabled={pending} onClick={submit}>
              {content.chores.addCta}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              {content.chores.cancel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-pill border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-ink-inverse"
          : "border-border text-ink-muted hover:bg-surface-muted"
      )}
    >
      {children}
    </button>
  );
}
