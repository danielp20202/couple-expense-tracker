import Link from "next/link";
import { content } from "@/content";
import { formatRelativeDay } from "@/lib/format";
import { clsx } from "@/lib/clsx";
import type { ChoreOccurrence, Profile } from "@/lib/types";
import { Card, SectionTitle } from "@/app/components/ui";
import { Avatar } from "@/app/components/Avatar";

const PER_PERSON = 4;

/** Earliest upcoming occurrence per chore (so a daily chore shows once, not 7×). */
function nextPerChore(list: ChoreOccurrence[]): ChoreOccurrence[] {
  const seen = new Map<string, ChoreOccurrence>();
  for (const o of [...list].sort((a, b) => a.date.localeCompare(b.date))) {
    if (!seen.has(o.chore.id)) seen.set(o.chore.id, o);
  }
  return Array.from(seen.values());
}

/**
 * A compact, read-only "what's coming up" list grouped by person, for the
 * dashboard. Shows each person's next few undone chores; an "Anyone" group
 * appears only when there are unassigned upcoming chores.
 */
export function UpcomingChores({
  occurrences,
  personA,
  personB,
  selectedId,
  today,
}: {
  occurrences: ChoreOccurrence[];
  personA: Profile;
  personB: Profile;
  selectedId: string;
  today: string;
}) {
  const upcoming = occurrences.filter((o) => !o.done);

  const groups: { id: string | null; name: string }[] = [
    { id: personA.id, name: personA.display_name ?? "" },
    { id: personB.id, name: personB.display_name ?? "" },
    { id: null, name: content.chores.unassigned },
  ];

  const rendered = groups
    .map((g) => ({
      ...g,
      items: nextPerChore(upcoming.filter((o) => o.chore.assigned_to === g.id)).slice(
        0,
        PER_PERSON
      ),
    }))
    // Always show the two people; only show "Anyone" if it has items.
    .filter((g) => g.id !== null || g.items.length > 0);

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-3">
        <SectionTitle>{content.dashboard.upcomingChoresTitle}</SectionTitle>
        <Link
          href="/chores"
          className="shrink-0 text-sm font-medium text-primary hover:underline"
        >
          {content.dashboard.viewChores}
        </Link>
      </div>

      <div className="space-y-4">
        {rendered.map((g) => {
          const isMe = g.id === selectedId;
          const photo = g.id ? content.profiles.photos[g.name] : undefined;
          return (
            <div key={g.id ?? "anyone"}>
              <div className="mb-2 flex items-center gap-2">
                <Avatar
                  name={g.name}
                  size={24}
                  photoSrc={photo}
                  className={clsx(!g.id && "opacity-40")}
                />
                <span className="text-sm font-medium text-ink">{g.name}</span>
                {isMe && (
                  <span className="text-xs text-ink-muted">({content.profiles.youTag})</span>
                )}
              </div>

              {g.items.length === 0 ? (
                <p className="pl-8 text-sm text-ink-muted">{content.dashboard.upcomingNone}</p>
              ) : (
                <ul className="space-y-1 pl-8">
                  {g.items.map((o) => (
                    <li
                      key={`${o.chore.id}|${o.date}`}
                      className="flex items-baseline justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 truncate text-ink">{o.chore.name}</span>
                      <span
                        className={clsx(
                          "shrink-0 text-xs font-medium",
                          o.date === today ? "text-primary" : "text-ink-muted"
                        )}
                      >
                        {formatRelativeDay(o.date, today)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
