"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { content } from "@/content";
import { seedMonthAction } from "@/app/actions/recurring";
import { Button } from "@/app/components/ui";

/**
 * Adds the given month's fixed costs on demand. Idempotent — costs already
 * added to that month aren't duplicated.
 */
export function SeedFixedCostsButton({ month }: { month: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function onClick() {
    startTransition(async () => {
      setMessage(null);
      const res = await seedMonthAction(month);
      if (res.error) {
        setMessage(res.error);
        return;
      }
      setMessage(content.dashboard.fixedCostsAdded(res.added));
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" onClick={onClick} disabled={pending}>
        {content.dashboard.addFixedCosts}
      </Button>
      {message && <span className="text-sm text-ink-muted">{message}</span>}
    </div>
  );
}
