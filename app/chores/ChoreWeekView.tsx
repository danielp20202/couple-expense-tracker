"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { content } from "@/content";
import { formatDateShort } from "@/lib/format";
import { parseDate, currentWeekMonday } from "@/lib/week";
import { clsx } from "@/lib/clsx";
import type { ChoreOccurrence, Profile } from "@/lib/types";
import { toggleChoreCompletion } from "@/app/actions/chores";
import { Card } from "@/app/components/ui";
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

export function ChoreWeekView({
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

  const people = [personA, personB];
  const nameOf = (id: string | null) =>
    (id && people.find((p) => p.id === id)?.display_name) || content.chores.unassigned;

  const todayMonday = currentWeekMonday();
  const today = todayMonday === week ? new Date() : null;
  const todayStr = today
    ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
        today.getDate()
      ).padStart(2, "0")}`
    : null;

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

  function toggle(o: ChoreOccurrence) {
    const key = `${o.chore.id}|${o.date}`;
    setBusyKey(key);
    startTransition(async () => {
      await toggleChoreCompletion(o.chore.id, o.date, selectedId);
      setBusyKey(null);
      router.refresh();
    });
  }

  const nothing = shown.length === 0;

  return (
    <div className="space-y-4">
      <Card>
        <WeekSwitcher week={week} />
        <div className="mt-3 flex gap-1 border-t border-border pt-3">
          <FilterTab active={filter === "everyone"} onClick={() => setFilter("everyone")}>
            {content.chores.filterEveryone}
          </FilterTab>
          <FilterTab active={filter === "mine"} onClick={() => setFilter("mine")}>
            {content.chores.filterMine}
          </FilterTab>
        </div>
      </Card>

      {nothing ? (
        <Card>
          <p className="text-sm text-ink-muted">
            {filter === "mine" ? content.chores.emptyWeekMine : content.chores.emptyWeek}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {days.map((date) => {
            const items = byDay.get(date) ?? [];
            const isToday = date === todayStr;
            const dow = content.chores.weekdayShort[parseDate(date).getDay()];
            return (
              <Card
                key={date}
                className={clsx("p-0 overflow-hidden", isToday && "ring-2 ring-primary/40")}
              >
                <div
                  className={clsx(
                    "flex items-baseline justify-between px-4 py-2.5 border-b border-border",
                    isToday ? "bg-primary/5" : "bg-surface-muted/40"
                  )}
                >
                  <span className="text-sm font-semibold text-ink">
                    {dow} <span className="text-ink-muted font-normal">· {formatDateShort(date)}</span>
                  </span>
                  {isToday && (
                    <span className="text-xs font-medium text-primary">{content.weeks.thisWeek}</span>
                  )}
                </div>

                {items.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-ink-muted">{content.chores.noneToday}</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {items.map((o) => {
                      const key = `${o.chore.id}|${o.date}`;
                      const mine = o.chore.assigned_to === selectedId;
                      const busy = busyKey === key && pending;
                      return (
                        <li
                          key={key}
                          className={clsx(
                            "flex items-center gap-3 px-4 py-3",
                            mine && !o.done && "border-l-2 border-l-primary"
                          )}
                        >
                          <button
                            type="button"
                            aria-pressed={o.done}
                            aria-label={o.done ? content.chores.done : o.chore.name}
                            disabled={busy}
                            onClick={() => toggle(o)}
                            className={clsx(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-50",
                              o.done
                                ? "border-positive bg-positive text-ink-inverse"
                                : "border-border hover:border-primary"
                            )}
                          >
                            {o.done && (
                              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                                <path
                                  fillRule="evenodd"
                                  d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <p
                              className={clsx(
                                "text-sm",
                                o.done ? "text-ink-muted line-through" : "text-ink font-medium"
                              )}
                            >
                              {o.chore.name}
                            </p>
                            {o.done && o.completed_by ? (
                              <p className="text-xs text-positive">
                                {content.chores.doneBy(nameOf(o.completed_by))}
                              </p>
                            ) : (
                              <p className="text-xs text-ink-muted">{nameOf(o.chore.assigned_to)}</p>
                            )}
                          </div>

                          <Avatar
                            name={nameOf(o.chore.assigned_to)}
                            size={28}
                            photoSrc={
                              o.chore.assigned_to
                                ? content.profiles.photos[nameOf(o.chore.assigned_to)]
                                : undefined
                            }
                            className={clsx(!o.chore.assigned_to && "opacity-40")}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
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
