"use client";

import { useState } from "react";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Category = { id: string; name: string; slug: string; count: number };

type Props = {
  categories: Category[];
  deleteCategory: (formData: FormData) => Promise<void>;
  renameCategory: (formData: FormData) => Promise<void>;
};

export function CategoryList({ categories, deleteCategory, renameCategory }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  if (categories.length === 0) {
    return (
      <p className="p-6 text-sm text-center text-muted-foreground">
        No categories yet. Create one to get started.
      </p>
    );
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setPending(id);
    const fd = new FormData();
    fd.set("id", id);
    try {
      await deleteCategory(fd);
      toast.success(`"${name}" deleted.`);
    } catch {
      toast.error("Failed to delete category.");
    } finally {
      setPending(null);
    }
  }

  async function handleRename(id: string) {
    if (!editName.trim()) return;
    setPending(id);
    const fd = new FormData();
    fd.set("id", id);
    fd.set("name", editName.trim());
    try {
      await renameCategory(fd);
      toast.success("Category renamed.");
      setEditingId(null);
    } catch {
      toast.error("Failed to rename category.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="divide-y">
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/40">
          {editingId === cat.id ? (
            <div className="flex items-center gap-2 flex-1 mr-3">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename(cat.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="h-8 text-sm"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-green-600 hover:text-green-700"
                onClick={() => handleRename(cat.id)}
                disabled={pending === cat.id}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setEditingId(null)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="min-w-0">
              <p className="text-sm font-medium">{cat.name}</p>
              <p className="text-xs text-muted-foreground font-mono">/{cat.slug}</p>
            </div>
          )}

          {editingId !== cat.id && (
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="secondary">{cat.count} articles</Badge>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(cat.id, cat.name)}
                disabled={pending === cat.id}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}