"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { content } from "@/content";
import { formatMoney } from "@/lib/format";
import { createSettlement } from "@/app/actions/settlement";
import { Button } from "@/app/components/ui";

/** Local YYYY-MM-DD so the logged date matches the user's timezone. */
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/**
 * Shown to the rent holder when there's a positive balance to reclaim. Logs a
 * settlement = the current amount, then the dashboard balance drops to $0.
 */
export function SettleTransferButton({
  profileId,
  amount,
}: {
  profileId: string;
  amount: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    startTransition(async () => {
      setError(null);
      const res = await createSettlement(profileId, amount, localToday());
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      <Button onClick={onClick} disabled={pending}>
        {content.profiles.settleButton(formatMoney(amount))}
      </Button>
      {error && <p className="mt-2 text-sm text-negative">{error}</p>}
    </div>
  );
}
