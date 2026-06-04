import { revalidatePath } from "next/cache";
import { FolderTree } from "lucide-react";

import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "@/features/categories/components/category-form";
import { CategoryList } from "@/features/categories/components/category-list";

async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, articles(count)")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function createCategory(formData: FormData) {
  "use server";
  const name = (formData.get("name") as string)?.trim();
  if (!name) return;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const supabase = await createClient();
  await supabase.from("categories").insert({ name, slug });
  revalidatePath("/admin/categories");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
}

async function renameCategory(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  if (!id || !name) return;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const supabase = await createClient();
  await supabase.from("categories").update({ name, slug }).eq("id", id);
  revalidatePath("/admin/categories");
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage article categories.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <CategoryForm createCategory={createCategory} />

        <div className="lg:col-span-2">
          <Card>
            <div className="p-4 border-b flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">{categories.length} categories</span>
            </div>
            <CategoryList
              categories={categories.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                count: (c.articles as { count: number }[])?.[0]?.count ?? 0,
              }))}
              deleteCategory={deleteCategory}
              renameCategory={renameCategory}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}