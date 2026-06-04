"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  createCategory: (formData: FormData) => Promise<void>;
};

export function CategoryForm({ createCategory }: Props) {
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const slug = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      await createCategory(formData);
      toast.success("Category created.");
      setName("");
      formRef.current?.reset();
    } catch {
      toast.error("Failed to create category.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="p-5 h-fit">
      <h2 className="font-semibold mb-4 flex items-center gap-2">
        <Plus className="h-4 w-4" /> New Category
      </h2>
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="cat-name">Name</Label>
          <Input
            id="cat-name"
            name="name"
            placeholder="e.g. Technology"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        {slug && (
          <p className="text-xs text-muted-foreground">
            Slug: <span className="font-mono text-foreground">/{slug}</span>
          </p>
        )}
        <Button type="submit" className="w-full" disabled={pending || !name.trim()}>
          {pending ? "Creating…" : "Create Category"}
        </Button>
      </form>
    </Card>
  );
}