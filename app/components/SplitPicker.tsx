"use client";

import { useEffect, useState } from "react";
import { content } from "@/content";
import type { Profile } from "@/lib/types";
import { Chip, Label } from "@/app/components/ui";

const PRESETS = [50, 60, 40];

/**
 * Two linked percentage inputs — one per person, always summing to 100.
 * `pctA` is person A's share; the parent stores it and anchors the split to
 * personA's id when saving (the server collapses an even 50 to the canonical
 * null/50 pair). Defaults to 50/50 so the forms stay quick for the normal case.
 */
export function SplitPicker({
  personA,
  personB,
  pctA,
  onChange,
  idPrefix,
}: {
  personA: Profile;
  personB: Profile;
  pctA: number;
  onChange: (pctA: number) => void;
  idPrefix: string;
}) {
  const [a, setA] = useState(String(pctA));
  const [b, setB] = useState(String(100 - pctA));

  // Re-sync when the parent resets (e.g. after submitting the form).
  useEffect(() => {
    setA(String(pctA));
    setB(String(100 - pctA));
  }, [pctA]);

  function clamp(n: number): number {
    return Math.min(100, Math.max(0, n));
  }

  function handle(text: string, who: "a" | "b") {
    (who === "a" ? setA : setB)(text);
    const n = Number(text);
    if (text.trim() === "" || !Number.isFinite(n)) return;
    const mine = clamp(n);
    const other = Math.round((100 - mine) * 100) / 100;
    (who === "a" ? setB : setA)(String(other));
    onChange(who === "a" ? mine : other);
  }

  function applyPreset(preset: number) {
    setA(String(preset));
    setB(String(100 - preset));
    onChange(preset);
  }

  const fieldClasses =
    "w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <Label htmlFor={`${idPrefix}-split-a`}>{content.split.label}</Label>
        <span className="font-mono text-[11px] text-ink-muted">
          {content.split.display(personA.display_name ?? "", Number(a) || 0, personB.display_name ?? "", Number(b) || 0)}
        </span>
      </div>
      <div className="mb-2 flex gap-2">
        {PRESETS.map((preset) => (
          <Chip key={preset} active={Number(a) === preset} onClick={() => applyPreset(preset)}>
            {preset}/{100 - preset}
          </Chip>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            { key: "a" as const, person: personA, value: a, id: `${idPrefix}-split-a` },
            { key: "b" as const, person: personB, value: b, id: `${idPrefix}-split-b` },
          ]
        ).map(({ key, person, value, id }) => (
          <div key={key} className="relative">
            <input
              id={id}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              className={`${fieldClasses} pr-8`}
              value={value}
              onChange={(e) => handle(e.target.value, key)}
              aria-label={`${person.display_name} %`}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-ink-muted">
              %
            </span>
            <p className="mt-0.5 text-xs text-ink-muted">{person.display_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Person A's percentage for an expense/template row (null anchor = 50/50). */
export function pctAOf(
  row: { split_profile_id: string | null; split_pct: number },
  personAId: string
): number {
  if (!row.split_profile_id) return 50;
  const pct = Number(row.split_pct);
  return row.split_profile_id === personAId ? pct : Math.round((100 - pct) * 100) / 100;
}
