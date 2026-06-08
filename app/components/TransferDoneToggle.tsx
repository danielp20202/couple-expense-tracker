"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { content } from "@/content";
import { formatDateShort } from "@/lib/format";
import { setTransferDone } from "@/app/actions/transfer";

/** Local YYYY-MM-DD (so the stamped day matches the user's timezone). */
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/**
 * Interactive checkbox the rent holder ticks once they've moved the
 * reimbursement from the joint account into their own account. Persists in
 * `transfer_status`; the partner sees a read-only version (rendered server-side).
 */
export function TransferDoneToggle({
  month,
  profileId,
  done,
  doneOn,
}: {
  month: string;
  profileId: string;
  done: boolean;
  doneOn: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.checked;
    startTransition(async () => {
      const res = await setTransferDone(
        month,
        profileId,
        next,
        next ? localToday() : null
      );
      if (!res.error) router.refresh();
    });
  }

  return (
    <label className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-sm text-ink cursor-pointer select-none">
      <input
        type="checkbox"
        className="h-4 w-4 accent-primary"
        checked={done}
        onChange={onChange}
        disabled={pending}
      />
      <span>{content.profiles.transferDoneLabel}</span>
      {done && doneOn && (
        <span className="text-xs text-ink-muted">
          · {content.profiles.transferDoneOn(formatDateShort(doneOn))}
        </span>
      )}
    </label>
  );
}
