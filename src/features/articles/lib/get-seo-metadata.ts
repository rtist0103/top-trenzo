import type { Metadata } from "next";

import { getPublishedArticleBySlug } from "@/repositories/article.repositories";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://TopTrenzo.news";

const SITE_NAME = "TopTrenzo";

export async function getSeoMetadata(slug: string): Promise<Metadata> {
  const article = await getPublishedArticleBySlug(slug);

  if (!article) return {};

  const title = article.seo_title?.trim() || article.title;
  const description =
    article.seo_description?.trim() ||
    article.short_description ||
    article.summary ||
    "";
  const image = article.featured_image || `${SITE_URL}/og-image.jpg`;
  const canonicalUrl = `${SITE_URL}/news/${slug}`;
  const locale = article.language === "hi" ? "hi_IN" : "en_IN";

  return {
    title,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "article",
      locale,
      publishedTime: article.published_at ?? undefined,
      section: article.category?.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}