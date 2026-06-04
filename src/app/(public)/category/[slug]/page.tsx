import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, TrendingUp } from "lucide-react";

import { PublicLayout } from "@/components/layout/public-layout";
import { ArticleCard } from "@/components/article/article-card";
import { PublicSearch } from "@/features/search/components/public-search";
import { getCategoryBySlug, getAllCategories } from "@/repositories/category.repositories";
import {
  getPublishedArticlesWithSearch,
  getMostViewedArticles,
} from "@/repositories/article.repositories";
import { formatDate } from "@/lib/format";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://TopTrenzo.news";
const PAGE_SIZE = 12;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; search?: string; language?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  const title = `${category.name} News — TopTrenzo`;
  const description = `Latest ${category.name} news and updates on TopTrenzo.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/category/${slug}` },
    openGraph: { title, description, url: `${SITE_URL}/category/${slug}`, siteName: "TopTrenzo", type: "website" },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [category, allCategories, trending] = await Promise.all([
    getCategoryBySlug(slug),
    getAllCategories(),
    getMostViewedArticles(5),
  ]);

  if (!category) notFound();

  const { articles, total } = await getPublishedArticlesWithSearch({
    limit: PAGE_SIZE,
    offset,
    categorySlug: slug,
    search: sp.search,
    language: sp.language,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildPageUrl(p: number) {
    const q = new URLSearchParams();
    if (sp.search) q.set("search", sp.search);
    if (sp.language) q.set("language", sp.language);
    if (p > 1) q.set("page", String(p));
    const qs = q.toString();
    return `/category/${slug}${qs ? `?${qs}` : ""}`;
  }

  return (
    <PublicLayout activeCategory={slug}>
      {/* Category hero banner */}
      <div className="mb-8 p-2 rounded-xl bg-linear-to-r from-foreground/5 to-primary/5 border">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary font-semibold">{category.name}</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">{category.name}</h1>
        <p className="text-muted-foreground text-sm">{total} article{total !== 1 ? "s" : ""} available</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        {/* Articles */}
        <div>
          {/* Search bar */}
          <div className="mb-6">
            <Suspense>
              <PublicSearch categories={allCategories} />
            </Suspense>
          </div>

          {articles.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground mb-4">No articles found in {category.name}.</p>
              <Link href={`/category/${slug}`} className="text-primary font-semibold hover:underline">Clear filters</Link>
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

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                  {page > 1 && (
                    <Link href={buildPageUrl(page - 1)} className="px-4 py-2 text-sm font-semibold border rounded-lg hover:bg-muted transition-colors">← Previous</Link>
                  )}
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                    <Link key={p} href={buildPageUrl(p)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${p === page ? "bg-primary text-primary-foreground" : "border hover:bg-muted"}`}>{p}</Link>
                  ))}
                  {page < totalPages && (
                    <Link href={buildPageUrl(page + 1)} className="px-4 py-2 text-sm font-semibold border rounded-lg hover:bg-muted transition-colors">Next →</Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Filter sidebar */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Filter Articles</h3>
            <Suspense>
              <PublicSearch categories={allCategories} isSidebar />
            </Suspense>
          </div>

          {/* Other categories */}
          <div className="rounded-xl border bg-card p-5">
            <div className="section-heading">
              <h3 className="text-sm font-bold uppercase tracking-tight">Other Topics</h3>
            </div>
            <div className="space-y-1">
              {allCategories.filter(c => c.slug !== slug).map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted transition-colors group">
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">{cat.name}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div className="rounded-xl border bg-card p-5">
            <div className="section-heading">
              <h3 className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Trending
              </h3>
            </div>
            <div className="space-y-3">
              {trending.map((article, i) => (
                <Link key={article.id} href={`/news/${article.slug}`} className="group flex gap-3">
                  <span className="trending-number w-8 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-xs font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">{article.title}</p>
                    {article.published_at && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(article.published_at)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </PublicLayout>
  );
}