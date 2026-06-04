import { ArticleCard } from "@/components/article/article-card";
import type { PublicArticle } from "@/repositories/article.repositories";

type Props = {
  articles: PublicArticle[];
  emptyMessage?: string;
};

export function ArticleGrid({
  articles,
  emptyMessage = "No articles found.",
}: Props) {
  if (articles.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
  );
}