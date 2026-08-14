"use client";

import { useState, useTransition } from "react";
import { content } from "@/content";
import { submitPreference } from "@/app/actions/preferences";
import { Button, Card, Chip, Input, Label, SectionTitle } from "@/app/components/ui";

/** Standing "what we're into lately" signal — not tied to any one entry.
 *  Category is multi-select (you can be into more than one thing at once),
 *  Vibe is single-select (mirrors how Vibe works on an activity itself), and
 *  a custom note is always available on top, per the household's request for
 *  presets *and* something custom. */
export function MoodPicker({ me }: { me: string }) {
  const [categories, setCategories] = useState<string[]>([]);
  const [vibe, setVibe] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleCategory(c: string) {
    setSuccess(false);
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  function toggleVibe(v: string) {
    setSuccess(false);
    setVibe((prev) => (prev === v ? null : v));
  }

  function submit() {
    if (categories.length === 0 && !vibe && !note.trim()) return;
    startTransition(async () => {
      setError(null);
      const res = await submitPreference({
        who: me,
        scope: "General",
        categories,
        vibe,
        note: note.trim() || null,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setCategories([]);
      setVibe(null);
      setNote("");
      setSuccess(true);
    });
  }

  const canSubmit = categories.length > 0 || Boolean(vibe) || note.trim().length > 0;

  return (
    <Card>
      <SectionTitle>{content.activities.moodTitle}</SectionTitle>
      <p className="text-sm text-ink-muted mb-3">{content.activities.moodHelp}</p>

      <Label>{content.activities.moodCategoryLabel}</Label>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {content.activities.moodCategories.map((c) => (
          <Chip key={c} active={categories.includes(c)} onClick={() => toggleCategory(c)}>
            {c}
          </Chip>
        ))}
      </div>

      <Label>{content.activities.moodVibeLabel}</Label>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {content.activities.moodVibes.map((v) => (
          <Chip key={v} active={vibe === v} onClick={() => toggleVibe(v)}>
            {v}
          </Chip>
        ))}
      </div>

      <div className="mb-3">
        <Input
          value={note}
          onChange={(e) => {
            setSuccess(false);
            setNote(e.target.value);
          }}
          placeholder={content.activities.moodNotePlaceholder}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={submit} disabled={pending || !canSubmit}>
          {pending ? content.activities.moodSending : content.activities.moodSubmit}
        </Button>
        {success && <p className="text-sm text-positive">{content.activities.moodSuccess}</p>}
        {error && <p className="text-sm text-negative">{error}</p>}
      </div>
    </Card>
  );
}
