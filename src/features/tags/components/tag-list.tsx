"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type Tag = { id: string; name: string; slug: string; count: number };
type Props = {
  tags: Tag[];
  deleteTag: (formData: FormData) => Promise<void>;
};

export function TagList({ tags, deleteTag }: Props) {
  const [pending, setPending] = useState<string | null>(null);

  if (tags.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No tags yet. Create one to get started.
      </p>
    );
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete tag "${name}"?`)) return;
    setPending(id);
    const fd = new FormData();
    fd.set("id", id);
    try {
      await deleteTag(fd);
      toast.success(`"${name}" deleted.`);
    } catch {
      toast.error("Failed to delete tag.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="p-4 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="flex items-center gap-1.5 rounded-full border bg-muted/50 pl-3 pr-1.5 py-1 text-sm"
        >
          <span>{tag.name}</span>
          <span className="text-xs text-muted-foreground">({tag.count})</span>
          <button
            title={`Delete "${tag.name}"`}
            type="button"
            disabled={pending === tag.id}
            onClick={() => handleDelete(tag.id, tag.name)}
            className="ml-1 flex h-5 w-5 items-center justify-center rounded-full hover:bg-destructive/20 hover:text-destructive transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}