import type { MetadataRoute } from "next";

import { getPublishedArticles } from "@/repositories/article.repositories";
import { getAllCategories } from "@/repositories/category.repositories";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://TopTrenzo.news";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories] = await Promise.all([
    getPublishedArticles({ limit: 1000 }),
    getAllCategories(),
  ]);

  const articleUrls: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/news/${article.slug}`,
    lastModified: article.published_at
      ? new Date(article.published_at)
      : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...categoryUrls,
    ...articleUrls,
  ];
}