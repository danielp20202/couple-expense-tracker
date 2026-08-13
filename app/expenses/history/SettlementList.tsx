"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { content } from "@/content";
import { formatMoney } from "@/lib/format";
import { deleteSettlement } from "@/app/actions/settlement";
import { Button, Card, Money } from "@/app/components/ui";
import type { Settlement } from "@/lib/types";

const MONTH_ABBR = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
function dayMonth(dateStr: string): { day: string; mon: string } {
  const [, mm, dd] = dateStr.split("-");
  return { day: dd, mon: MONTH_ABBR[Number(mm) - 1] ?? mm };
}

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
            <div className="w-9 shrink-0 text-center">
              <div className="font-mono text-[15px] font-medium leading-none text-ink">
                {dayMonth(s.date).day}
              </div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-wide text-ink-muted">
                {dayMonth(s.date).mon}
              </div>
            </div>
            <div className="min-w-0 flex-1 truncate font-serif italic font-semibold text-positive">
              {content.profiles.transferRowLabel}
            </div>
            <Money value={formatMoney(Number(s.amount))} tone="positive" className="shrink-0 text-[15px] font-semibold" />
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
