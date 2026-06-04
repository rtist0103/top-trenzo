import { revalidatePath } from "next/cache";
import { FolderTree } from "lucide-react";

import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "@/features/categories/components/category-form";
import { CategoryList } from "@/features/categories/components/category-list";

async function getCategories() {
  const supabase = await createClient();
  const [catRes, orderRes] = await Promise.all([
    supabase.from("categories").select("id, name, slug, articles(count)"),
    supabase.from("site_settings").select("value").eq("key", "category_order").single(),
  ]);

  if (catRes.error) throw new Error(catRes.error.message);

  let order: string[] = [];
  try {
    if (orderRes.data?.value) {
      order = JSON.parse(orderRes.data.value);
    }
  } catch {}

  const categories = catRes.data ?? [];
  categories.sort((a, b) => {
    const aIdx = order.indexOf(a.id);
    const bIdx = order.indexOf(b.id);
    if (aIdx === -1 && bIdx === -1) return a.name.localeCompare(b.name);
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  return categories;
}

async function createCategory(formData: FormData) {
  "use server";
  const name = (formData.get("name") as string)?.trim();
  if (!name) return;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const supabase = await createClient();
  await supabase.from("categories").insert({ name, slug });
  revalidatePath("/");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const supabase = await createClient();
  
  // Set category_id to null for articles under this category to avoid foreign key violations
  await supabase.from("articles").update({ category_id: null }).eq("category_id", id);
  
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

async function renameCategory(formData: FormData) {
  "use server";
  const id = (formData.get("id") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  if (!id || name === undefined) return;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const supabase = await createClient();
  await supabase.from("categories").update({ name, slug }).eq("id", id);
  revalidatePath("/");
}

async function reorderCategories(formData: FormData) {
  "use server";
  const orderJson = formData.get("order") as string;
  if (!orderJson) return;
  const supabase = await createClient();
  
  const { data: existing } = await supabase.from("site_settings").select("id").eq("key", "category_order").single();
  const id = existing?.id || crypto.randomUUID();

  const { error } = await supabase.from("site_settings").upsert({
    id,
    key: "category_order",
    value: orderJson,
    label: "Category Order",
    description: "Category Order JSON",
    category: "general",
    input_type: "text",
    is_public: true
  }, { onConflict: "key" });

  if (error) throw new Error(error.message);
  
  revalidatePath("/");
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
              reorderCategories={reorderCategories}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}