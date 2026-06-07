import { createClient } from "@/lib/supabase/server";
import type { PublicArticle } from "./article.repositories";

export type SlotType = "hero" | "trending" | "live";

const ARTICLE_SELECT = `
  id, title, slug, summary,
  featured_image, published_at, language,
  categories ( name, slug )
`;

function normalize(row: {
  categories?: { name: string; slug: string } | { name: string; slug: string }[] | null;
  [key: string]: unknown;
}): PublicArticle {
  const { categories, ...rest } = row;
  const category = Array.isArray(categories)
    ? (categories[0] ?? null)
    : (categories ?? null);
  return {
    ...(rest as Omit<PublicArticle, "category">),
    category,
  };
}

// ── Public ──────────────────────────────────────────────────────

export async function getFeaturedArticles(
  slot: SlotType,
  limit = 6,
): Promise<PublicArticle[]> {
  const supabase = await createClient();

  // Step 1: get ordered article IDs from the slots table
  const { data: slots, error: slotsError } = await supabase
    .from("featured_slots")
    .select("article_id, sort_order")
    .eq("slot", slot)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (slotsError) throw new Error(slotsError.message);
  if (!slots || slots.length === 0) return [];

  const orderedIds = slots.map((s) => s.article_id as string);

  // Step 2: fetch the actual articles by ID
  const { data: articles, error: articlesError } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .in("id", orderedIds)
    .eq("status", "published");

  if (articlesError) throw new Error(articlesError.message);
  if (!articles || articles.length === 0) return [];

  // Step 3: re-sort to match the slot order (DB .in() doesn't guarantee order)
  const articleMap = new Map(
    articles.map((a) => [a.id as string, a]),
  );

  return orderedIds
    .map((id) => articleMap.get(id))
    .filter((a): a is typeof articles[number] => a !== null && a !== undefined)
    .map((a) =>
      normalize(
        a as {
          categories?: { name: string; slug: string } | { name: string; slug: string }[] | null;
          [key: string]: unknown;
        },
      ),
    );
}

// ── Admin ─────────────────────────────────────────────────────

export type FeaturedSlot = {
  id: string;
  slot: SlotType;
  article_id: string;
  sort_order: number;
  article: {
    id: string;
    title: string;
    slug: string;
    featured_image: string | null;
    published_at: string | null;
    categories: { name: string } | { name: string }[] | null;
  };
};

export async function getFeaturedSlots(slot: SlotType): Promise<FeaturedSlot[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("featured_slots")
    .select(`
      id, slot, article_id, sort_order,
      articles ( id, title, slug, featured_image, published_at,
        categories ( name ) )
    `)
    .eq("slot", slot)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const a = row.articles as
      | FeaturedSlot["article"]
      | FeaturedSlot["article"][]
      | null;
    const article = Array.isArray(a) ? (a[0] ?? null) : a;
    return {
      id: row.id as string,
      slot: row.slot as SlotType,
      article_id: row.article_id as string,
      sort_order: row.sort_order as number,
      article: article as FeaturedSlot["article"],
    };
  });
}

export async function addFeaturedSlot(
  slot: SlotType,
  articleId: string,
  sortOrder: number,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("featured_slots")
    .upsert({ slot, article_id: articleId, sort_order: sortOrder });
  if (error) throw new Error(error.message);
}

export async function removeFeaturedSlot(id: string): Promise<void> {
  const supabase = await createClient();
  
  // Get the slot and sort_order of the item being deleted
  const { data: slot, error: fetchError } = await supabase
    .from("featured_slots")
    .select("slot, sort_order")
    .eq("id", id)
    .single();
  
  if (fetchError) throw new Error(fetchError.message);
  if (!slot) throw new Error("Slot not found");

  // Delete the item
  const { error: deleteError } = await supabase
    .from("featured_slots")
    .delete()
    .eq("id", id);
  
  if (deleteError) throw new Error(deleteError.message);

  // Renumber remaining items in this slot to fill the gap
  const { data: remaining, error: remainingError } = await supabase
    .from("featured_slots")
    .select("id, sort_order")
    .eq("slot", slot.slot)
    .order("sort_order", { ascending: true });

  if (remainingError) throw new Error(remainingError.message);
  
  if (!remaining || remaining.length === 0) return;

  // Update all items with sequential sort_order
  // Type assertion needed because TypeScript doesn't narrow array type after length check
  const itemsToUpdate = remaining as Array<{ id: string; sort_order: number }>;
  
  for (const [index, item] of itemsToUpdate.entries()) {
  const { error: updateError } = await supabase
    .from("featured_slots")
    .update({ sort_order: index })
    .eq("id", item.id);

  if (updateError) throw new Error(updateError.message);
}
}

export async function reorderFeaturedSlot(
  id: string,
  newSortOrder: number,
): Promise<void> {
  const supabase = await createClient();

  // Step 1: Get the slot
  const { data: movedItem, error: fetchError } = await supabase
    .from("featured_slots")
    .select("slot")
    .eq("id", id)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  if (!movedItem) throw new Error("Item not found");

  const { slot } = movedItem;

  // Step 2: Get all items in this slot
  const { data: allItems, error: listError } = await supabase
    .from("featured_slots")
    .select("id, sort_order")
    .eq("slot", slot)
    .order("sort_order", { ascending: true });

  if (listError) throw new Error(listError.message);
  if (!allItems || allItems.length === 0) return;

  const items = allItems as Array<{
    id: string;
    sort_order: number;
  }>;

  // Step 3: Create new order
  const itemsWithoutMoved = items.filter(
    (item) => item.id !== id,
  );

  const clampedSortOrder = Math.max(
    0,
    Math.min(newSortOrder, itemsWithoutMoved.length),
  );

  itemsWithoutMoved.splice(clampedSortOrder, 0, {
    id,
    sort_order: clampedSortOrder,
  });

  // Step 4: Update all items
  for (const [index, item] of itemsWithoutMoved.entries()) {
    const { error: updateError } = await supabase
      .from("featured_slots")
      .update({ sort_order: index })
      .eq("id", item.id);

    if (updateError) throw new Error(updateError.message);
  }
}