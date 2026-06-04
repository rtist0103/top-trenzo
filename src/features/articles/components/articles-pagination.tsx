"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

type Props = {
  currentPage: number;

  totalPages: number;

  totalArticles: number;

  query: URLSearchParams;
};

export function ArticlesPagination({
  currentPage,
  totalPages,
  totalArticles,
  query,
}: Props) {
  if (totalPages <= 1 && totalArticles <= 10) {
    return (
      <div className="pt-4 text-center text-sm text-muted-foreground">
        {totalArticles} articles
      </div>
    );
  }

  function createPageLink(page: number) {
    const params = new URLSearchParams(query.toString());

    params.set("page", String(page));

    return `/admin/articles?${params.toString()}`;
  }

  function getVisiblePages() {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      return Array.from(
        {
          length: totalPages,
        },
        (_, i) => i + 1,
      );
    }

    pages.push(1);

    if (currentPage > 4) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);

    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  }

  const pages = getVisiblePages();

  return (
    <div
      className="
        flex
        flex-col
        items-center
        gap-4
        pt-6
        md:flex-row
        md:justify-between
      "
    >
      {/* Article count */}
      <p className="text-sm text-muted-foreground">
        {totalArticles} {totalArticles === 1 ? "article" : "articles"}
      </p>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* Previous */}
        {currentPage > 1 && (
          <Link href={createPageLink(currentPage - 1)}>
            <Button variant="outline">Previous</Button>
          </Link>
        )}

        {/* Pages */}
        {pages.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <Link key={page} href={createPageLink(page)}>
              <Button
                variant={currentPage === page ? "default" : "outline"}
                className="min-w-10"
              >
                {page}
              </Button>
            </Link>
          ),
        )}

        {/* Next */}
        {currentPage < totalPages && (
          <Link href={createPageLink(currentPage + 1)}>
            <Button variant="outline">Next</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
