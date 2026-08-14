"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { content } from "@/content";
import { deleteActivity } from "@/app/actions/activities";
import { Button } from "@/app/components/ui";

export function DeleteActivityButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    if (!confirm(content.activities.confirmDelete(name))) return;
    startTransition(async () => {
      setError(null);
      const res = await deleteActivity(id);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-3">
      <Button variant="danger" onClick={onClick} disabled={pending}>
        {content.activities.delete}
      </Button>
      {error && <p className="mt-2 text-xs text-negative">{error}</p>}
    </div>
  );
}
