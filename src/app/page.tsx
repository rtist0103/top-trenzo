import type { Metadata } from "next";
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
  const [allArticles, featuredHero, featuredTrending, featuredLive, categories] =
    await Promise.all([
      getPublishedArticles({ limit: 50 }),
      getFeaturedArticles("hero", 5),
      getFeaturedArticles("trending", 4),
      getFeaturedArticles("live", 10),
      getAllCategories(),
    ]);

  // Hero carousel: pinned → fallback to latest
  const carouselArticles =
    featuredHero.length > 0 ? featuredHero : allArticles.slice(0, 5);

  // Trending sidebar: pinned → fallback to latest (max 4)
  const mostViewed =
    featuredTrending.length > 0
      ? featuredTrending.slice(0, 4)
      : allArticles.slice(0, 4);

  // Live ticker: pinned → fallback to trending (max 10)
  // This is a SEPARATE slot from trending — managed independently in admin
  const tickerArticles =
    featuredLive.length > 0
      ? featuredLive.slice(0, 10)
      : mostViewed.slice(0, 10);

  const latestArticles = allArticles;

  return (
    <PublicLayout>
      {/* ── LIVE TICKER — uses "live" slot, NOT trending ── */}
      {tickerArticles.length > 0 && (
        <div className="ticker-bar mb-6 overflow-hidden rounded-lg flex">
          <span className="ticker-label">
            <span className="ticker-dot live-pulse" />
            Live
          </span>
          <div className="overflow-hidden flex-1 py-2 text-xs font-bold">
            <div className="ticker-content">
              {[...tickerArticles, ...tickerArticles].map((a, i) => (
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
        <section className="mb-8 p-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <HeroCarousel articles={carouselArticles} />
            </div>

            {/* Trending Now — uses "trending" slot */}
            <div className="rounded-2xl border bg-card p-5 shadow-lg flex flex-col h-full">
              <div className="section-heading mb-4">
                <h3 className="text-base font-bold uppercase tracking-tight flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Trending Now
                </h3>
              </div>

              <div className="space-y-4 overflow-y-auto scrollbar-thin pr-2 flex-1">
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
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                          {article.category.name}
                        </span>
                      )}

                      <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </p>

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
          </div>
        </section>
      )}

      <Separator className="mb-8" />

      {/* ── MAIN CONTENT ── */}
      <div className="space-y-10 min-w-0">
        {/* Latest News */}
        {latestArticles.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="section-heading mb-0">
                <h2 className="text-xl font-bold uppercase tracking-tight">
                  Latest News
                </h2>
              </div>

              <Link
                href="/news"
                className="text-sm font-bold text-primary flex items-center gap-1 hover:underline"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory scroll-smooth w-full">
              {latestArticles.slice(0, 10).map((article) => (
                <div
                  key={article.id}
                  className="w-70 sm:w-[320px] shrink-0 snap-start"
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

        {/* Category sections */}
        {categories.map((cat, idx) => {
          const catArticles = latestArticles.filter(
            (a) => a.category?.slug === cat.slug,
          );
          if (catArticles.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-10">
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="section-heading mb-0">
                    <h2 className="text-xl font-bold uppercase tracking-tight">
                      {cat.name}
                    </h2>
                  </div>

                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm font-bold text-primary flex items-center gap-1 hover:underline"
                  >
                    More <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory scroll-smooth w-full">
                  {catArticles.slice(0, 8).map((article) => (
                    <div
                      key={article.id}
                      className="w-70 sm:w-[320px] shrink-0 snap-start"
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

              {idx === 0 && (
                <div className="rounded-2xl bg-primary text-primary-foreground p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
                  <div className="flex items-center gap-4 text-center md:text-left">
                    <Flame className="h-10 w-10 hidden md:block" />
                    <div>
                      <h3 className="font-bold text-2xl mb-1">Stay Updated with TopTrendzo</h3>
                      <p className="text-white/80">Get the latest trends and stories delivered directly to your inbox.</p>
                    </div>
                  </div>
                  <Link
                    href="#newsletter"
                    className="bg-white text-primary text-base font-bold py-3 px-8 rounded-xl hover:bg-white/90 transition-colors whitespace-nowrap shadow-sm"
                  >
                    Subscribe for Free
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PublicLayout>
  );
}