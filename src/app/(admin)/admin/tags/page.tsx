import { revalidatePath } from "next/cache";
import { Tag } from "lucide-react";

import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { TagForm } from "@/features/tags/components/tag-form";
import { TagList } from "@/features/tags/components/tag-list";

async function getTags() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug, article_tags(count)")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function createTag(formData: FormData) {
  "use server";
  const name = (formData.get("name") as string)?.trim();
  if (!name) return;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const supabase = await createClient();
  await supabase.from("tags").insert({ name, slug });
  revalidatePath("/admin/tags");
}

async function deleteTag(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const supabase = await createClient();
  await supabase.from("tags").delete().eq("id", id);
  revalidatePath("/admin/tags");
}

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Tags</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage article tags.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <TagForm createTag={createTag} />

        <div className="lg:col-span-2">
          <Card>
            <div className="p-4 border-b flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">{tags.length} tags</span>
            </div>
            <TagList
              tags={tags.map((t) => ({
                id: t.id,
                name: t.name,
                slug: t.slug,
                count: (t.article_tags as { count: number }[])?.[0]?.count ?? 0,
              }))}
              deleteTag={deleteTag}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}