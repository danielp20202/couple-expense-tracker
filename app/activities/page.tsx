import { getActivities, ACTIVITY_STATUS_ORDER } from "@/lib/activities";
import { isNotionConfigured } from "@/lib/notion";
import { getCouple } from "@/lib/profiles";
import { getSelectedProfileId } from "@/lib/profile-session";
import { content } from "@/content";
import { formatMoney } from "@/lib/format";
import { Card, Chip, SectionTitle, PageTitle } from "@/app/components/ui";
import { DeleteActivityButton } from "@/app/components/DeleteActivityButton";
import { StarRating } from "@/app/components/StarRating";
import { MoreLikeThisButton } from "@/app/components/MoreLikeThisButton";
import { MoodPicker } from "@/app/components/MoodPicker";
import type { Activity } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Viewer {
  name: string;
  partnerName: string;
}

export default async function ActivitiesPage() {
  if (!isNotionConfigured()) {
    return (
      <div className="space-y-5">
        <PageTitle>{content.activities.title}</PageTitle>
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
        <PageTitle>{content.activities.title}</PageTitle>
        <Card className="bg-warning-bg border-warning-bg">
          <p className="text-sm text-ink">{content.activities.loadError}</p>
        </Card>
      </div>
    );
  }

  // Ratings and mood signals need to know who's asking — reuses the same
  // profile switcher as the rest of the app. Degrades gracefully to a
  // read-only list if no profile is selected yet (or Postgres isn't set up).
  const couple = await getCouple().catch(() => null);
  const selectedId = getSelectedProfileId();
  let viewer: Viewer | null = null;
  if (couple && selectedId) {
    if (selectedId === couple.personA.id) {
      viewer = {
        name: couple.personA.display_name ?? "",
        partnerName: couple.personB.display_name ?? "",
      };
    } else if (selectedId === couple.personB.id) {
      viewer = {
        name: couple.personB.display_name ?? "",
        partnerName: couple.personA.display_name ?? "",
      };
    }
  }

  return (
    <div className="space-y-5">
      <SectionTitle>{content.activities.title}</SectionTitle>
      <p className="text-sm text-ink-muted">{content.activities.help}</p>

      {viewer ? (
        <MoodPicker me={viewer.name} />
      ) : (
        <Card className="bg-warning-bg border-warning-bg">
          <p className="text-sm text-ink">{content.activities.needsProfile}</p>
        </Card>
      )}

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
                  <ActivityCard key={a.id} activity={a} viewer={viewer} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function ActivityCard({ activity, viewer }: { activity: Activity; viewer: Viewer | null }) {
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
  ].filter((s): s is string => Boolean(s));

  const myRating = viewer ? activity.ratings.find((r) => r.name === viewer.name)?.value ?? null : null;
  const partnerRating = viewer
    ? activity.ratings.find((r) => r.name === viewer.partnerName)?.value ?? null
    : null;

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

      <h3 className="font-serif text-base font-semibold text-ink">{activity.name}</h3>
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

      {(activity.link || activity.mapLink || viewer) && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {activity.link && (
            <a
              href={activity.link}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-ink-muted underline hover:text-ink transition-colors"
            >
              {activity.link.replace(/^https?:\/\//, "").split("/")[0]}
            </a>
          )}
          {activity.mapLink && (
            <a
              href={activity.mapLink}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-ink-muted underline hover:text-ink transition-colors"
            >
              {content.activities.openInMaps}
            </a>
          )}
          {viewer && (
            <MoreLikeThisButton
              activityId={activity.id}
              activityName={activity.name}
              me={viewer.name}
              categories={activity.categories}
              vibe={activity.vibe}
            />
          )}
        </div>
      )}

      {viewer && (
        <StarRating
          activityId={activity.id}
          me={viewer.name}
          myValue={myRating}
          partnerName={viewer.partnerName}
          partnerValue={partnerRating}
        />
      )}

      <DeleteActivityButton id={activity.id} name={activity.name} />
    </Card>
  );
}
