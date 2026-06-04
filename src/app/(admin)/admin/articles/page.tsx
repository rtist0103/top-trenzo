import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ArticlesFilter } from "@/features/articles/components/article-filters";
import { ArticleStatusButton } from "@/features/articles/components/article-status-button";
import { ArticlesPagination } from "@/features/articles/components/articles-pagination";
import { DeleteArticleButton } from "@/features/articles/components/delete-article-button";
import { getArticles } from "@/features/articles/queries/get-articles";
import { ArticleListItem } from "@/features/articles/types/article";
import { getCategories } from "@/features/categories/queries/get-categories";


type Props = {
  searchParams: Promise<{
    search?: string;
    page?: string;
    category?: string;

    status?: "draft" | "review" | "published" | "archived";

    language?: "en" | "hi";
  }>;
};

export default async function ArticlesPage({ searchParams }: Props) {
  const params = await searchParams;
  const categories = await getCategories();
  const page = Number(params.page) || 1;

  const { articles, total, totalPages } = await getArticles({
    page,
    search: params.search,
    category: params.category,
    status: params.status,
    language: params.language,
  });

  if (page > totalPages && page > 1) {
    const redirectQuery = new URLSearchParams();

    if (params.search) {
      redirectQuery.set("search", params.search);
    }

    if (params.category) {
      redirectQuery.set("category", params.category);
    }

    if (params.status) {
      redirectQuery.set("status", params.status);
    }

    if (params.language) {
      redirectQuery.set("language", params.language);
    }

    redirectQuery.set("page", totalPages > 0 ? String(totalPages) : "1");

    redirect(`/admin/articles?${redirectQuery.toString()}`);
  }

  const query = new URLSearchParams();

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.category) {
    query.set("category", params.category);
  }

  if (params.status) {
    query.set("status", params.status);
  }

  if (params.language) {
    query.set("language", params.language);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="
          flex
          items-center
          justify-between
        "
      >
        <div>
          <h1 className="text-3xl font-bold">Articles</h1>

          <p className="text-muted-foreground">Manage your articles</p>
        </div>

        <Link href="/admin/articles/new">
          <Button>New Article</Button>
        </Link>
      </div>

      {/* Filters */}
      <ArticlesFilter categories={categories} />

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-max min-w-full table-auto">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="p-3 text-left whitespace-nowrap">Title</th>

                <th className="hidden md:table-cell p-3 text-left whitespace-nowrap">
                  Category
                </th>

                <th className="p-3 text-left whitespace-nowrap">Status</th>

                <th className="hidden md:table-cell p-3 text-left whitespace-nowrap">
                  Language
                </th>

                <th className="hidden md:table-cell p-3 text-left whitespace-nowrap">
                  Created
                </th>

                <th className="p-3 text-left whitespace-nowrap">Actions</th>
              </tr>
            </thead>

            <tbody>
              {articles.map((article: ArticleListItem) => (
                <tr key={article.id} className="border-b">
                  <td className="p-3 min-w-55 max-w-70">
                    <div>
                      <p className="font-medium truncate">{article.title}</p>
                      <span className="hidden md:block">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {article.short_description}
                        </p>
                      </span>
                    </div>
                  </td>

                  <td className="hidden md:table-cell p-3 whitespace-nowrap">
                    {article.category?.name ?? "-"}
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <ArticleStatusButton
                        articleId={article.id}
                        status={article.status}
                      />
                    </div>
                  </td>

                  <td className="hidden md:table-cell p-3 whitespace-nowrap uppercase">
                    {article.language}
                  </td>

                  <td className="hidden md:table-cell p-3 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(article.created_at).toLocaleDateString()}
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/articles/${article.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>

                      <DeleteArticleButton articleId={article.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <ArticlesPagination
        currentPage={page}
        totalPages={totalPages}
        totalArticles={total}
        query={query}
      />
    </div>
  );
}