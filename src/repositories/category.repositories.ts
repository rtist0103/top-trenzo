import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/features/categories/queries/get-categories";

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  if (error) throw new Error(error.message);

  return data ?? [];
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