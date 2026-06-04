import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

import { PublicLayout } from "@/components/layout/public-layout";
import { ArticleCard } from "@/components/article/article-card";
import { PublicSearch } from "@/features/search/components/public-search";
import {
  getPublishedArticlesWithSearch,
  getMostViewedArticles,
} from "@/repositories/article.repositories";
import { getAllCategories } from "@/repositories/category.repositories";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Latest News — TopTrenzo",
  description: "Browse all the latest news and trending stories on TopTrenzo.",
};

type Props = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    language?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 12;

export default async function NewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [{ articles, total }, mostViewed, categories] = await Promise.all([
    getPublishedArticlesWithSearch({
      limit: PAGE_SIZE,
      offset,
      search: params.search,
      categorySlug: params.category,
      language: params.language,
    }),
    getMostViewedArticles(5),
    getAllCategories(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilters = !!(params.search || params.category || params.language);

  function buildPageUrl(p: number) {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.category) q.set("category", params.category);
    if (params.language) q.set("language", params.language);
    if (p > 1) q.set("page", String(p));
    const qs = q.toString();
    return `/news${qs ? `?${qs}` : ""}`;
  }

  return (
    <PublicLayout>
      {/* Page header */}
      <div className="mb-8">
        <div className="section-heading">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">
            {hasFilters ? "Search Results" : "Latest News"}
          </h1>
        </div>
        {hasFilters && (
          <p className="text-sm text-muted-foreground mb-4">
            {total} article{total !== 1 ? "s" : ""} found
            {params.search && <> for &ldquo;<strong>{params.search}</strong>&rdquo;</>}
          </p>
        )}

        {/* Search + filter bar (mobile-first, compact) */}
        <Suspense>
          <PublicSearch categories={categories} />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        {/* Articles grid */}
        <div>
          {articles.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground text-lg">No articles found.</p>
              <Link href="/news" className="mt-4 inline-block text-sm text-primary font-semibold hover:underline">
                Clear filters →
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    title={article.title}
                    summary={article.summary}
                    slug={article.slug}
                    image={article.featured_image}
                    category={article.category}
                    publishedAt={article.published_at}
                    language={article.language}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                  {page > 1 && (
                    <Link href={buildPageUrl(page - 1)} className="px-4 py-2 text-sm font-semibold border rounded-lg hover:bg-muted transition-colors">
                      ← Previous
                    </Link>
                  )}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <Link
                        key={p}
                        href={buildPageUrl(p)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                          p === page
                            ? "bg-primary text-primary-foreground"
                            : "border hover:bg-muted"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                  {page < totalPages && (
                    <Link href={buildPageUrl(page + 1)} className="px-4 py-2 text-sm font-semibold border rounded-lg hover:bg-muted transition-colors">
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Search sidebar widget */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Refine Search</h3>
            <Suspense>
              <PublicSearch categories={categories} isSidebar />
            </Suspense>
          </div>

          {/* Trending */}
          <div className="rounded-xl border bg-card p-5">
            <div className="section-heading">
              <h3 className="text-base font-bold uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Trending
              </h3>
            </div>
            <div className="space-y-4">
              {mostViewed.map((article, i) => (
                <Link key={article.id} href={`/news/${article.slug}`} className="group flex gap-3">
                  <span className="trending-number w-8 shrink-0 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    {article.category && (
                      <span className="text-[10px] font-bold text-primary uppercase">{article.category.name}</span>
                    )}
                    <p className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">{article.title}</p>
                    {article.published_at && (
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(article.published_at)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="rounded-xl border bg-card p-5">
            <div className="section-heading">
              <h3 className="text-base font-bold uppercase tracking-tight">Topics</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`} className="text-xs font-semibold px-3 py-1.5 rounded-full border hover:bg-primary hover:text-white hover:border-primary transition-colors">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </PublicLayout>
  );
}
