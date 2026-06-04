import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { PublicLayout } from "@/components/layout/public-layout";
import { ArticleCard } from "@/components/article/article-card";
import { PublicSearch } from "@/features/search/components/public-search";
import { getPublishedArticlesWithSearch } from "@/repositories/article.repositories";
import { getAllCategories } from "@/repositories/category.repositories";

export const metadata: Metadata = {
  title: "Search — TopTrenzo",
  description: "Search all articles on TopTrenzo.",
};

type Props = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    language?: string;
  }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const hasQuery = !!(params.search || params.category || params.language);

  const [{ articles, total }, categories] = await Promise.all([
    hasQuery
      ? getPublishedArticlesWithSearch({
          limit: 20,
          search: params.search,
          categorySlug: params.category,
          language: params.language,
        })
      : Promise.resolve({ articles: [], total: 0 }),
    getAllCategories(),
  ]);

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <Search className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-3xl font-bold mb-2">Search Articles</h1>
          <p className="text-muted-foreground">Find news, trends, and stories that matter</p>
        </div>

        {/* Search bar */}
        <div className="mb-8">
          <Suspense>
            <PublicSearch categories={categories} />
          </Suspense>
        </div>

        {/* Results */}
        {!hasQuery ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Start typing to search for articles...</p>
            <div className="mt-8">
              <p className="text-sm font-bold uppercase tracking-wider mb-4 text-muted-foreground">Browse Topics</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((cat) => (
                  <Link key={cat.id} href={`?category=${cat.slug}`} className="text-sm font-semibold px-4 py-2 rounded-full border hover:bg-primary hover:text-white hover:border-primary transition-colors">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-5">
              {total} result{total !== 1 ? "s" : ""}
              {params.search && <> for &ldquo;<strong className="text-foreground">{params.search}</strong>&rdquo;</>}
            </p>
            {articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No articles matched your search.</p>
                <Link href="/search" className="text-primary font-semibold hover:underline">Clear search</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
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
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
