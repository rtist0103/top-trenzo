import { createClient } from "@/lib/supabase/server";

export type AffiliateProduct = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: string | null;
  rating: number | null;
  buy_url: string;
  badge: string | null;
  created_at: string;
  updated_at: string;
};

const PRODUCT_SELECT = `
  id, title, description, image_url,
  price, rating, buy_url, badge,
  created_at, updated_at
`;

// ── Public ────────────────────────────────────────────────────────────────

/** Returns products linked to an article, ordered by sort_order. Empty = none. */
export async function getProductsForArticle(
  articleId: string,
): Promise<AffiliateProduct[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("article_affiliate_products")
    .select(`sort_order, affiliate_products (${PRODUCT_SELECT})`)
    .eq("article_id", articleId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? [])
    .flatMap((row) => {
      const p = row.affiliate_products;
      if (!p) return [];
      // Supabase may return a single object or an array depending on the relation
      return Array.isArray(p) ? p : [p];
    })
    .filter((p): p is AffiliateProduct =>
      p !== null && typeof p === "object" && "id" in p,
    );
}

// ── Admin — product library ───────────────────────────────────────────────

export async function getAllAffiliateProducts(): Promise<AffiliateProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("affiliate_products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createAffiliateProduct(
  payload: Pick<AffiliateProduct, "title" | "description" | "image_url" | "price" | "rating" | "buy_url" | "badge">,
): Promise<AffiliateProduct> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("affiliate_products")
    .insert(payload)
    .select(PRODUCT_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateAffiliateProduct(
  id: string,
  payload: Partial<Pick<AffiliateProduct, "title" | "description" | "image_url" | "price" | "rating" | "buy_url" | "badge">>,
): Promise<AffiliateProduct> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("affiliate_products")
    .update(payload)
    .eq("id", id)
    .select(PRODUCT_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteAffiliateProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("affiliate_products")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Admin — article↔product links ────────────────────────────────────────

/** Replace all products on an article with a new ordered list. */
export async function setArticleProducts(
  articleId: string,
  productIds: string[],   // ordered
): Promise<void> {
  const supabase = await createClient();

  // Delete existing links for this article
  const { error: delError } = await supabase
    .from("article_affiliate_products")
    .delete()
    .eq("article_id", articleId);

  if (delError) throw new Error(delError.message);

  if (productIds.length === 0) return;

  const rows = productIds.map((product_id, i) => ({
    article_id: articleId,
    product_id,
    sort_order: i,
  }));

  const { error: insError } = await supabase
    .from("article_affiliate_products")
    .insert(rows);

  if (insError) throw new Error(insError.message);
}

/** Fetch products already linked to an article (for pre-filling the panel). */
export async function getLinkedProductIds(
  articleId: string,
): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("article_affiliate_products")
    .select("product_id, sort_order")
    .eq("article_id", articleId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.product_id);
}