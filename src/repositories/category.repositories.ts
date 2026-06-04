import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/features/categories/queries/get-categories";

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const [catRes, orderRes] = await Promise.all([
    supabase.from("categories").select("id, name, slug"),
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

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw new Error(error.message);

  return data;
}