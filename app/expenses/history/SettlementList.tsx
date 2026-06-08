"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { content } from "@/content";
import { formatMoney, formatDateShort } from "@/lib/format";
import { deleteSettlement } from "@/app/actions/settlement";
import { Button, Card, Money } from "@/app/components/ui";
import type { Settlement } from "@/lib/types";

/** The "Transfers" list in History — logged settlements, with an undo (delete). */
export function SettlementList({ settlements }: { settlements: Settlement[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (settlements.length === 0) return null;

  return (
    <Card className="p-0 overflow-hidden">
      {error && <p className="text-sm text-negative px-4 pt-3">{error}</p>}
      <ul className="divide-y divide-border">
        {settlements.map((s) => (
          <li key={s.id} className="flex items-center gap-3 px-4 py-3">
            <div className="w-14 shrink-0 text-sm text-ink-muted">
              {formatDateShort(s.date)}
            </div>
            <div className="min-w-0 flex-1 truncate text-ink font-medium">
              {content.profiles.transferRowLabel}
            </div>
            <Money value={formatMoney(Number(s.amount))} className="shrink-0" />
            <Button
              variant="danger"
              disabled={pending}
              onClick={() => {
                if (!confirm(content.history.confirmDeleteTransfer)) return;
                startTransition(async () => {
                  setError(null);
                  const res = await deleteSettlement(s.id);
                  if (res.error) {
                    setError(res.error);
                    return;
                  }
                  router.refresh();
                });
              }}
            >
              {content.history.delete}
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
