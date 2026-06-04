import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { getRelatedArticles } from "@/repositories/article.repositories";
import { formatDate } from "@/lib/format";

type Props = {
  articleId: string;
  category: { name: string; slug: string };
};

export async function MoreInCategory({ articleId, category }: Props) {
  const articles = await getRelatedArticles(articleId, category.slug, 3);

  if (articles.length === 0) return null;

  return (
    <div className="more-in-strip">
      <div className="more-in-strip__header">
        <div className="more-in-strip__heading">
          <span className="more-in-strip__bar" />
          <h2 className="more-in-strip__title">More in {category.name}</h2>
        </div>
        <Link href={`/category/${category.slug}`} className="more-in-strip__link">
          See all <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="more-in-strip__grid">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="strip-article group"
          >
            <div className="strip-article__img">
              {article.featured_image ? (
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <span className="text-xs font-black text-muted-foreground/20">TT</span>
                </div>
              )}
            </div>
            <div className="strip-article__body">
              <span className="strip-article__cat">{category.name}</span>
              <p className="strip-article__title">{article.title}</p>
              {article.published_at && (
                <time dateTime={article.published_at} className="strip-article__date">
                  {formatDate(article.published_at)}
                </time>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}