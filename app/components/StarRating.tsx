"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { content } from "@/content";
import { rateActivity } from "@/app/actions/activities";
import { clsx } from "@/lib/clsx";

/** One 5-star row. Interactive for "your" rating (tap a star to set it, tap
 *  the same star again to clear); read-only for your partner's. Always
 *  visible to both — no blind-voting gate. */
function Stars({
  value,
  interactive,
  pending,
  onSet,
}: {
  value: number | null;
  interactive: boolean;
  pending: boolean;
  onSet?: (n: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          role={interactive ? "button" : undefined}
          aria-label={interactive ? content.activities.rateAria(n) : undefined}
          onClick={interactive && !pending ? () => onSet?.(n) : undefined}
          className={clsx(
            "text-sm leading-none",
            (value ?? 0) >= n ? "text-primary" : "text-border",
            interactive && !pending && "cursor-pointer",
            interactive && "select-none"
          )}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function StarRating({
  activityId,
  me,
  myValue,
  partnerName,
  partnerValue,
}: {
  activityId: string;
  me: string;
  myValue: number | null;
  partnerName: string;
  partnerValue: number | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onSet(n: number) {
    const next = myValue === n ? null : n;
    startTransition(async () => {
      await rateActivity(activityId, me, next);
      router.refresh();
    });
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-ink-muted">{content.activities.you}</span>
        <Stars value={myValue} interactive pending={pending} onSet={onSet} />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-ink-muted">{partnerName}</span>
        <Stars value={partnerValue} interactive={false} pending={false} />
      </div>
    </div>
  );
}
