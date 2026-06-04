"use server";

import { PostgrestError } from "@supabase/supabase-js";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { createArticleSchema } from "../lib/article-schema";

type Payload = {
  title: string;
  slug: string;
  shortDescription: string;
  content: unknown;

  categoryId?: string;
  language?: "en" | "hi";
  tagIds?: string[];

  sourceName?: string;
  sourceUrl?: string;

  featuredImage?: string;
  youtubeVideoUrl?: string;

  seoTitle?: string;
  seoDescription?: string;
};

/* ----------------------------------
   DB Error Mapper
---------------------------------- */

function getFriendlyDatabaseError(error: PostgrestError): string {
  switch (error.code) {
    // NOT NULL constraint
    case "23502":
      return "Please fill all required fields.";

    // UNIQUE constraint
    case "23505":
      return "An article with this title or slug already exists.";

    // Foreign key constraint
    case "23503":
      return "Please select a valid category.";

    // Check constraint
    case "23514":
      return "Invalid article data.";

    default:
      return "Something went wrong while saving the article.";
  }
}

export async function createArticle(payload: Payload): Promise<{
  success: boolean;
}> {
  try {
    /* -------------------------
       Validate
    ------------------------- */

    const result = createArticleSchema.safeParse(payload);

    if (!result.success) {
      throw new Error(result.error.issues[0]?.message ?? "Validation failed.");
    }

    const validated = result.data;

    /* -------------------------
       Supabase
    ------------------------- */

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("You must be logged in.");
    }

    /* -------------------------
       Create Article
    ------------------------- */

    const { data: article, error } = await supabase
      .from("articles")
      .insert({
        title: validated.title,

        slug: validated.slug,

        short_description: validated.shortDescription,

        content: validated.content,

        summary: validated.shortDescription,

        category_id: validated.categoryId || null,

        language: validated.language ?? "en",

        source_name: validated.sourceName || null,

        source_url: validated.sourceUrl || null,

        featured_image: validated.featuredImage || null,

        youtube_video_url: validated.youtubeVideoUrl || null,

        seo_title: validated.seoTitle || null,

        seo_description: validated.seoDescription || null,

        author_id: user.id,

        created_by: user.id,

        status: "draft",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Create article error:", error);

      throw new Error(getFriendlyDatabaseError(error));
    }

    /* -------------------------
       Tag Sync
    ------------------------- */

    if (validated.tagIds?.length) {
      const { error: tagError } = await supabase.from("article_tags").insert(
        validated.tagIds.map((tagId) => ({
          article_id: article.id,
          tag_id: tagId,
        })),
      );

      if (tagError) {
        console.error("Tag sync error:", tagError);

        throw new Error("Failed to save article tags.");
      }
    }

    /* -------------------------
       Refresh
    ------------------------- */

    revalidatePath("/admin/articles");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Create article action error:", error);

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Something went wrong.");
  }
}
