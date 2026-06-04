import { createClient } from "@/lib/supabase/server";

export type PublicArticle = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  featured_image: string | null;
  published_at: string | null;
  language: "en" | "hi" | null;
  category: { name: string; slug: string } | null;
};

export type PublicArticleDetail = PublicArticle & {
  short_description: string;
  content: unknown;
  source_name: string | null;
  source_url: string | null;
  youtube_video_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

const PUBLIC_ARTICLE_SELECT = `
  id,
  title,
  slug,
  summary,
  featured_image,
  published_at,
  language,
  categories (
    name,
    slug
  )
`;

function normalizeArticle(row: {
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

export async function getPublishedArticles({
  limit = 20,
  categoryId,
}: {
  limit?: number;
  categoryId?: string;
} = {}): Promise<PublicArticle[]> {
  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select(PUBLIC_ARTICLE_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return (data ?? []).map(normalizeArticle);
}

export async function getPublishedArticleBySlug(
  slug: string,
): Promise<PublicArticleDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      ${PUBLIC_ARTICLE_SELECT},
      short_description,
      content,
      source_name,
      source_url,
      youtube_video_url,
      seo_title,
      seo_description
    `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw new Error(error.message);

  return normalizeArticle(data) as PublicArticleDetail;
}
export async function getPublishedArticlesWithSearch({
  limit = 20,
  offset = 0,
  categorySlug,
  search,
  language,
}: {
  limit?: number;
  offset?: number;
  categorySlug?: string;
  search?: string;
  language?: string;
} = {}): Promise<{ articles: PublicArticle[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select(`${PUBLIC_ARTICLE_SELECT}`, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search?.trim()) {
    query = query.or(`title.ilike.%${search.trim()}%,summary.ilike.%${search.trim()}%`);
  }

  if (categorySlug) {
    // Resolve slug → id first, then filter on the FK column.
    // Filtering on nested table columns (categories.slug) is silently
    // ignored by PostgREST — we must use the actual FK column.
    const { data: catRow } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (catRow?.id) {
      query = query.eq("category_id", catRow.id);
    } else {
      // Unknown slug → return nothing
      return { articles: [], total: 0 };
    }
  }

  if (language && language !== "all") {
    query = query.eq("language", language);
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return {
    articles: (data ?? []).map(normalizeArticle),
    total: count ?? 0,
  };
}

export async function getRelatedArticles(
  articleId: string,
  categorySlug: string | null,
  limit = 4,
): Promise<PublicArticle[]> {
  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select(PUBLIC_ARTICLE_SELECT)
    .eq("status", "published")
    .neq("id", articleId)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (categorySlug) {
    const { data: catRow } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (catRow?.id) {
      query = query.eq("category_id", catRow.id);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeArticle);
}

export async function getMostViewedArticles(limit = 5): Promise<PublicArticle[]> {
  // Falls back to latest since we don't have view tracking yet
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(PUBLIC_ARTICLE_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeArticle);
}