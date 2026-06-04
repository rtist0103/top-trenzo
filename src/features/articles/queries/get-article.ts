import { createClient } from "@/lib/supabase/server";

export async function getArticle(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(
      `
        *,
        article_tags (
          tag_id
        )
      `,
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
