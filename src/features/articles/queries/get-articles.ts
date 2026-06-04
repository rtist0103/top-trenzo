import { createClient } from "@/lib/supabase/server";

type Params = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  language?: string;
};

export async function getArticles({
  page = 1,
  limit = 10,
  search,
  category,
  status,
  language,
}: Params) {
  const supabase = await createClient();

  const from = (page - 1) * limit;

  const to = from + limit - 1;

  let query = supabase.from("articles").select(
    `
        *,
        category:categories(name)
        `,
    {
      count: "exact",
    },
  );

  /* Search */
  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  /* Category */
  if (category && category !== "all") {
    query = query.eq("category_id", category);
  }

  /* Status */
  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  /* Language */
  if (language && language !== "all") {
    query = query.eq("language", language);
  }

  /* Pagination */
  const { data, error, count } = await query
    .order("created_at", {
      ascending: false,
    })
    .range(from, to);

  if (error && error.code !== "PGRST103") {
    throw new Error(error.message);
  }

  return {
    articles: data || [],
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / limit),
    currentPage: page,
  };
}
