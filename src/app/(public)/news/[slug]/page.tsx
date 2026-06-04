import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Clock, ChevronRight } from "lucide-react";

import { PublicLayout } from "@/components/layout/public-layout";
import { Badge } from "@/components/ui/badge";
import { AffiliateSection } from "@/components/article/affiliate-section";
import { ShareBar } from "@/components/article/share-bar";
import { MoreInCategory } from "@/components/layout/more-in-categories";
import { ReadingProgress } from "@/components/article/reading-progress";
import { ArticleContent } from "@/features/articles/components/article-content";
import { getPublishedArticleBySlug } from "@/repositories/article.repositories";
import { formatDate, formatReadTime } from "@/lib/format";
import { getSeoMetadata } from "@/features/articles/lib/get-seo-metadata";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toptrenzo.com";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return getSeoMetadata(slug);
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.seo_title?.trim() || article.title,
    description: article.seo_description?.trim() || article.short_description,
    url: `${SITE_URL}/news/${slug}`,
    datePublished: article.published_at ?? undefined,
    image: article.featured_image ? [article.featured_image] : [`${SITE_URL}/og-image.jpg`],
    publisher: {
      "@type": "Organization",
      name: "TopTrenzo",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    ...(article.category && { articleSection: article.category.name }),
    inLanguage: article.language === "hi" ? "hi-IN" : "en-IN",
  };

  return (
    <PublicLayout activeCategory={article.category?.slug}>
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />

      {/* Reading-focused single column, max-w-3xl */}
      <div className="mx-auto max-w-3xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          {article.category && (
            <>
              <Link href={`/category/${article.category.slug}`} className="hover:text-primary transition-colors">
                {article.category.name}
              </Link>
              <ChevronRight className="h-3 w-3 shrink-0" />
            </>
          )}
          <span className="truncate text-foreground/50">{article.title}</span>
        </nav>

        {/* Category label */}
        {article.category && (
          <Link
            href={`/category/${article.category.slug}`}
            className="inline-block bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-widest px-3 py-1 mb-4 hover:bg-primary/90 transition-colors"
          >
            {article.category.name}
          </Link>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-4">
          {article.title}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-7">
          {article.published_at && (
            <time dateTime={article.published_at} className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {formatDate(article.published_at)}
            </time>
          )}
          <span>{formatReadTime(article.content)} read</span>
          {article.language === "hi" && (
            <Badge variant="secondary" className="font-semibold">हिंदी</Badge>
          )}
        </div>

        {/* Share bar */}
        <div className="mb-7">
          <ShareBar
            title={article.title}
            url={`${SITE_URL}/news/${slug}`}
          />
        </div>

        {/* Featured Image */}
        {article.featured_image && (
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl shadow-sm">
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        {/* Quick Summary */}
        <div className="mb-8 border-l-4 border-primary bg-muted/40 px-5 py-4 rounded-r-lg">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">Summary</p>
          <p className="text-base leading-relaxed">{article.short_description}</p>
        </div>

        {/* Article body */}
        <div className="prose prose-lg max-w-none
          prose-headings:font-bold prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:leading-relaxed prose-p:mb-5
          prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-xl prose-img:shadow-sm
          prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:py-0.5 prose-blockquote:rounded-r-lg
        ">
          <ArticleContent content={article.content} />
        </div>

        {/* YouTube */}
        {article.youtube_video_url && (
          <div className="mt-8">
            <YoutubeEmbed url={article.youtube_video_url} />
          </div>
        )}

        {/* Source */}
        {article.source_name && (
          <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Source: </span>
            {article.source_url ? (
              <a href={article.source_url} target="_blank" rel="noopener noreferrer"
                className="text-primary font-medium hover:underline">
                {article.source_name}
              </a>
            ) : article.source_name}
          </div>
        )}

        {/* ── AFFILIATE PRODUCTS — only if linked in admin ── */}
        <AffiliateSection articleId={article.id} />

        {/* ── MORE IN CATEGORY strip ── */}
        {article.category && (
          <MoreInCategory
            articleId={article.id}
            category={article.category}
          />
        )}
      </div>
    </PublicLayout>
  );
}

function YoutubeEmbed({ url }: { url: string }) {
  const videoId = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/,
  )?.[1];
  if (!videoId) return null;
  return (
    <div className="overflow-hidden rounded-xl">
      <div className="relative aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Article video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}