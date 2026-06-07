"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { content } from "@/content";
import type { ExpenseType } from "@/lib/types";
import { createType, deleteType, renameType } from "@/app/actions/types";
import { Button, Card, Input } from "@/app/components/ui";

export function TypesManager({
  types,
  createdBy,
}: {
  types: ExpenseType[];
  createdBy: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function run(fn: () => Promise<{ error: string | null }>, after?: () => void) {
    startTransition(async () => {
      setError(null);
      const res = await fn();
      if (res.error) {
        setError(res.error);
        return;
      }
      after?.();
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex gap-2">
          <Input
            placeholder={content.types.addPlaceholder}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newName.trim()) {
                run(() => createType(newName, createdBy), () => setNewName(""));
              }
            }}
          />
          <Button
            disabled={pending || !newName.trim()}
            onClick={() =>
              run(() => createType(newName, createdBy), () => setNewName(""))
            }
          >
            {content.types.add}
          </Button>
        </div>
      </Card>

      {error && <p className="text-sm text-negative">{error}</p>}

      {types.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-muted">{content.types.empty}</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <ul className="divide-y divide-border">
            {types.map((t) => (
              <li key={t.id} className="flex items-center gap-2 px-4 py-3">
                {editingId === t.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <Button
                      disabled={pending}
                      onClick={() =>
                        run(
                          () => renameType(t.id, editName),
                          () => setEditingId(null)
                        )
                      }
                    >
                      {content.types.save}
                    </Button>
                    <Button variant="ghost" onClick={() => setEditingId(null)}>
                      {content.types.cancel}
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-ink">{t.name}</span>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditingId(t.id);
                        setEditName(t.name);
                      }}
                    >
                      {content.types.rename}
                    </Button>
                    <Button
                      variant="danger"
                      disabled={pending}
                      onClick={() => {
                        if (!confirm(content.types.confirmDelete)) return;
                        run(() => deleteType(t.id));
                      }}
                    >
                      {content.types.delete}
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
