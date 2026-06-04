"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { setArticleProducts } from "@/repositories/affiliate-products.repositories";

import { updateArticleSchema } from "../lib/article-schema";

type Payload = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  content: unknown;

  categoryId?: string;
  tagIds?: string[];
  affiliateProductIds?: string[];
  language?: "en" | "hi";
  status?: "draft" | "review" | "published" | "archived";

  sourceName?: string;
  sourceUrl?: string;
  featuredImage?: string;
  youtubeVideoUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export async function updateArticle(payload: Payload) {
  const validated = updateArticleSchema.parse(payload);

  const supabase = await createClient();

  const { error } = await supabase
    .from("articles")
    .update({
      title: validated.title,
      slug: validated.slug,
      short_description: validated.shortDescription,
      status: validated.status,
      content: validated.content,
      category_id: validated.categoryId || null,
      language: validated.language,
      source_name: validated.sourceName || null,
      source_url: validated.sourceUrl || null,
      featured_image: validated.featuredImage || null,
      youtube_video_url: validated.youtubeVideoUrl || null,
      seo_title: validated.seoTitle || null,
      seo_description: validated.seoDescription || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", validated.id);

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  /* ── TAG SYNC ── */
  if (validated.tagIds !== undefined) {
    const { error: deleteError } = await supabase
      .from("article_tags")
      .delete()
      .eq("article_id", validated.id);

    if (deleteError) throw new Error(deleteError.message);

    if (validated.tagIds.length > 0) {
      const { error: insertError } = await supabase.from("article_tags").insert(
        validated.tagIds.map((tagId) => ({
          article_id: validated.id,
          tag_id: tagId,
        })),
      );
      if (insertError) throw new Error(insertError.message);
    }
  }

  /* ── AFFILIATE PRODUCTS SYNC ── */
  if (payload.affiliateProductIds !== undefined) {
    await setArticleProducts(validated.id, payload.affiliateProductIds);
  }

  revalidatePath("/admin/articles");
  revalidatePath(`/news/${validated.slug}`);

  redirect("/admin/articles");
}