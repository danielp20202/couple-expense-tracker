import { getActivities, ACTIVITY_STATUS_ORDER } from "@/lib/activities";
import { isNotionConfigured } from "@/lib/notion";
import { content } from "@/content";
import { formatMoney } from "@/lib/format";
import { Card, Chip, SectionTitle } from "@/app/components/ui";
import type { Activity } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  if (!isNotionConfigured()) {
    return (
      <div className="space-y-5">
        <SectionTitle>{content.activities.title}</SectionTitle>
        <Card className="bg-warning-bg border-warning-bg">
          <p className="text-sm text-ink">{content.activities.notConfigured}</p>
        </Card>
      </div>
    );
  }

  let activities: Activity[];
  try {
    activities = await getActivities();
  } catch (err) {
    console.error("Failed to load activities from Notion:", err);
    return (
      <div className="space-y-5">
        <SectionTitle>{content.activities.title}</SectionTitle>
        <Card className="bg-warning-bg border-warning-bg">
          <p className="text-sm text-ink">{content.activities.loadError}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SectionTitle>{content.activities.title}</SectionTitle>
      <p className="text-sm text-ink-muted">{content.activities.help}</p>

      {activities.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-muted">{content.activities.empty}</p>
        </Card>
      ) : (
        ACTIVITY_STATUS_ORDER.map((status) => {
          const group = activities.filter((a) => a.status === status);
          if (group.length === 0) return null;
          return (
            <div key={status} className="space-y-3">
              <SectionTitle>
                {content.activities.statusGroups[status] ?? status}
              </SectionTitle>
              <div className="space-y-3">
                {group.map((a) => (
                  <ActivityCard key={a.id} activity={a} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const meta = [activity.city, activity.type].filter(Boolean).join(" · ");
  const hasTags =
    activity.categories.length > 0 ||
    Boolean(activity.vibe) ||
    Boolean(activity.indoorOutdoor) ||
    activity.seasons.length > 0;

  // Cost is just one more fact about the entry, not the headline — folded in
  // alongside drive time / who / rating rather than shown as a money figure.
  const footer = [
    activity.driveTimeMinutes != null
      ? content.activities.driveTime(activity.driveTimeMinutes)
      : null,
    activity.who ? content.activities.who[activity.who] ?? activity.who : null,
    activity.estCost != null ? formatMoney(activity.estCost) : null,
    activity.rating != null ? `★ ${activity.rating}` : null,
  ].filter((s): s is string => Boolean(s));

  return (
    <Card>
      {activity.coverImage && (
        <div className="-mx-5 -mt-5 mb-4 overflow-hidden rounded-t-card">
          <img
            src={activity.coverImage}
            alt=""
            loading="lazy"
            className="h-40 w-full object-cover"
          />
        </div>
      )}

      <h3 className="text-sm font-semibold text-ink">{activity.name}</h3>
      {meta && <p className="text-xs text-ink-muted mt-0.5">{meta}</p>}

      {activity.description && (
        <p className="text-sm text-ink mt-2">{activity.description}</p>
      )}

      {hasTags && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {activity.categories.map((c) => (
            <Chip key={c}>{c}</Chip>
          ))}
          {activity.vibe && <Chip>{activity.vibe}</Chip>}
          {activity.indoorOutdoor && <Chip>{activity.indoorOutdoor}</Chip>}
          {activity.seasons.map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>
      )}

      {footer.length > 0 && (
        <p className="text-xs text-ink-muted mt-3">{footer.join(" · ")}</p>
      )}

      {activity.tip && <p className="text-xs text-ink-muted mt-3 italic">{activity.tip}</p>}

      {activity.link && (
        <a
          href={activity.link}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-xs text-primary underline"
        >
          {activity.link.replace(/^https?:\/\//, "").split("/")[0]}
        </a>
      )}
    </Card>
  );
}
