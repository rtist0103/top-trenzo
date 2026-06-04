import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TrendingUp, ChevronRight, Flame } from "lucide-react";

import { PublicLayout } from "@/components/layout/public-layout";
import { ArticleCard } from "@/components/article/article-card";
import { HeroCarousel } from "@/components/article/hero-carousel";
import { Separator } from "@/components/ui/separator";
import { getPublishedArticles } from "@/repositories/article.repositories";
import { getFeaturedArticles } from "@/repositories/featured-slots.repositories";
import { getAllCategories } from "@/repositories/category.repositories";
import { getSettingsMap } from "@/features/settings/repositories/settings.repositories";
import { formatDate } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettingsMap();
  const title = `${s.site_name} — ${s.site_description}`;
  return {
    title,
    description: s.site_description,
    alternates: { canonical: s.site_url },
    openGraph: {
      title,
      description: s.site_description,
      url: s.site_url,
      siteName: s.site_name,
      type: "website",
      locale: "en_IN",
      images: [
        {
          url: `${s.site_url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: s.site_name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: s.site_description,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [allArticles, featuredHero, featuredTrending, categories] = await Promise.all([
    getPublishedArticles({ limit: 20 }),
    getFeaturedArticles("hero", 5),
    getFeaturedArticles("trending", 7),
    getAllCategories(),
  ]);

  // Hero: use pinned articles if set, otherwise fall back to latest
  const carouselArticles = featuredHero.length > 0
    ? featuredHero
    : allArticles.slice(0, 4);
  const featuredSecondary = allArticles
    .filter((a) => !carouselArticles.some((c) => c.id === a.id))
    .slice(0, 3);

  // Trending: use pinned articles if set, otherwise fall back to latest
  const mostViewed = featuredTrending.length > 0
    ? featuredTrending
    : allArticles.slice(0, 5);

  const latestArticles = allArticles
    .filter((a) => !carouselArticles.some((c) => c.id === a.id))
    .slice(0, 9);
  const categoryArticles = allArticles.slice(0, 6);

  return (
    <PublicLayout>
      {/* ── Trending TICKER — uses pinned trending articles ── */}
      {mostViewed.length > 0 && (
        <div className="ticker-bar mb-6 overflow-hidden rounded-lg flex">
          <span className="ticker-label">
            <span className="ticker-dot live-pulse" />
            Trending
          </span>
          <div className="overflow-hidden flex-1 py-2 text-xs font-bold">
            <div className="ticker-content">
              {[...mostViewed, ...mostViewed].map((a, i) => (
                <Link
                  key={i}
                  href={`/news/${a.slug}`}
                  className="hover:underline inline-block mr-12"
                >
                  {a.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HERO SECTION ── */}
      {carouselArticles.length > 0 && (
        <section className="mb-5 p-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main hero - Carousel */}
            <div className="lg:col-span-2">
              <HeroCarousel articles={carouselArticles} />
            </div>

            {/* Secondary hero stack */}
            <div className="flex flex-col gap-3">
              {featuredSecondary.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group flex gap-3 rounded-lg border bg-card p-3 hover:border-primary transition-colors"
                >
                  {article.featured_image && (
                    <div className="relative w-24 h-20 shrink-0 img-zoom rounded-md overflow-hidden bg-muted">
                      <Image
                        src={article.featured_image}
                        alt={article.title}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {article.category && (
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        {article.category.name}
                      </span>
                    )}
                    <h3 className="text-sm font-bold line-clamp-2 leading-tight mt-0.5 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    {article.published_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(article.published_at)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Separator className="mb-5"/>

      {/* ── MAIN CONTENT + SIDEBAR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        {/* LEFT CONTENT */}
        <div className="space-y-6 min-w-0">
          {/* ── LATEST NEWS ── */}
          {latestArticles.length > 0 && (
            <section className="shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="section-heading mb-0">
                  <h2 className="text-xl font-bold uppercase tracking-tight">
                    Latest News
                  </h2>
                </div>

                <Link
                  href="/news"
                  className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                >
                  View All <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth w-full max-w-full">
                {latestArticles.map((article) => (
                  <div
                    key={article.id}
                    className="w-60 sm:w-65 shrink-0 snap-start"
                  >
                    <ArticleCard
                      title={article.title}
                      summary={article.summary}
                      slug={article.slug}
                      image={article.featured_image}
                      category={article.category}
                      publishedAt={article.published_at}
                      language={article.language}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── CATEGORY SECTIONS ── */}
          {categories.slice(0, 3).map((cat) => {
            const catArticles = categoryArticles.filter(
              (a) => a.category?.slug === cat.slug,
            );

            if (catArticles.length === 0) return null;

            return (
              <section className="border-b" key={cat.id}>
                <div className="flex items-center justify-between mb-4">
                  <div className="section-heading mb-0">
                    <h2 className="text-xl font-bold uppercase tracking-tight">
                      {cat.name}
                    </h2>
                  </div>

                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                  >
                    More <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth w-full max-w-full">
                  {catArticles.slice(0, 4).map((article) => (
                    <div
                      key={article.id}
                      className="w-60 sm:w-65 shrink-0 snap-start"
                    >
                      <ArticleCard
                        title={article.title}
                        summary={article.summary}
                        slug={article.slug}
                        image={article.featured_image}
                        category={article.category}
                        publishedAt={article.published_at}
                        language={article.language}
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <aside className="space-y-6 lg:sticky lg:top-24 self-start">
          {/* Trending Now */}
          <div className="rounded-xl border bg-card p-4">
            <div className="section-heading">
              <h3 className="text-base font-bold uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Trending Now
              </h3>
            </div>

            <div className="space-y-4">
              {mostViewed.map((article, i) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group flex gap-3"
                >
                  <span className="trending-number w-8 shrink-0 mt-0.5 group-hover:text-primary/40!">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div>
                    {article.category && (
                      <span className="text-[10px] font-bold text-primary uppercase">
                        {article.category.name}
                      </span>
                    )}

                    <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </p>

                    {article.published_at && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(article.published_at)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="rounded-xl border bg-card p-4">
              <div className="section-heading">
                <h3 className="text-base font-bold uppercase tracking-tight">
                  Browse by Topic
                </h3>
              </div>

              <div className="space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      {cat.name}
                    </span>

                    <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Advertisement */}
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-4 text-center">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Advertisement
            </p>

            <div className="h-40 flex items-center justify-center rounded-md bg-background">
              <p className="text-muted-foreground text-sm">300×250 Ad</p>
            </div>
          </div>

          {/* Newsletter */}
          <div className="rounded-xl bg-primary text-primary-foreground p-4">
            <Flame className="h-6 w-6 mb-3" />

            <h3 className="font-bold text-lg mb-1">Stay Updated</h3>

            <p className="text-sm text-white/80 mb-4">
              Get the latest trends delivered to your inbox daily.
            </p>

            <Link
              href="#newsletter"
              className="block text-center bg-white text-primary text-sm font-bold py-2.5 px-4 rounded-lg hover:bg-white/90 transition-colors"
            >
              Subscribe Free →
            </Link>
          </div>
        </aside>
      </div>
    </PublicLayout>
  );
}