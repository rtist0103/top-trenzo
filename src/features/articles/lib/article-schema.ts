import { z } from "zod";

export const createArticleSchema =
  z.object({
    title: z
      .string()
      .min(
        3,
        "Title must be at least 3 characters.",
      ),

    slug: z
      .string()
      .min(
        3,
        "Slug must be at least 3 characters.",
      ),

    shortDescription:
      z
        .string()
        .min(
          10,
          "Short description must be at least 10 characters.",
        ),

    content: z.any(),

    categoryId: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value ||
          z.uuid().safeParse(
            value,
          ).success,
        {
          message:
            "Please select a category.",
        },
      ),

    language:
      z
        .enum([
          "en",
          "hi",
        ])
        .optional(),

    tagIds: z
      .array(
        z
          .string()
          .uuid(),
      )
      .optional(),

    sourceName:
      z.string().optional(),

    sourceUrl: z
      .string()
      .url(
        "Please enter a valid source URL.",
      )
      .optional()
      .or(
        z.literal(""),
      ),

    featuredImage:
      z.string().optional(),

    youtubeVideoUrl:
      z
        .string()
        .url(
          "Please enter a valid YouTube URL.",
        )
        .optional()
        .or(
          z.literal(""),
        ),

    seoTitle:
      z.string().optional(),

    seoDescription:
      z.string().optional(),
  });

export const updateArticleSchema =
  createArticleSchema.extend(
    {
      id: z
        .string()
        .uuid(),

      status: z
        .enum([
          "draft",
          "review",
          "published",
          "archived",
        ])
        .optional(),
    },
  );