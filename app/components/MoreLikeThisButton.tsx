"use client";

import { useState, useTransition } from "react";
import { content } from "@/content";
import { submitPreference } from "@/app/actions/preferences";
import { clsx } from "@/lib/clsx";

/** Not destructive, so no confirm() — one tap logs "more like this" as a
 *  preference signal and shows a brief inline confirmation. No page refresh:
 *  signal rows never appear in the activity list, so nothing here changes. */
export function MoreLikeThisButton({
  activityId,
  activityName,
  me,
  categories,
  vibe,
}: {
  activityId: string;
  activityName: string;
  me: string;
  categories: string[];
  vibe: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function onClick() {
    startTransition(async () => {
      await submitPreference({
        who: me,
        scope: "Entry",
        targetId: activityId,
        targetName: activityName,
        categories,
        vibe,
      });
      setDone(true);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending || done}
      className={clsx(
        "text-xs underline transition-colors",
        done ? "text-positive no-underline" : "text-ink-muted hover:text-ink"
      )}
    >
      {done ? content.activities.moreLikeThisDone : content.activities.moreLikeThis}
    </button>
  );
}
