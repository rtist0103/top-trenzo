import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

type Props = {
  title: string;
  summary: string;
  slug: string;
  image?: string | null;
  category?: { name: string; slug: string } | null;
  publishedAt?: string | null;
  language?: "en" | "hi" | null;
};

export function ArticleCard({
  title,
  summary,
  slug,
  image,
  category,
  publishedAt,
  language,
}: Props) {
  return (
    <Link href={`/news/${slug}`} className="group flex flex-col h-full">
      <div className="flex flex-col h-full overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-300">

        {/* Image — fixed 16:10 ratio via .card-img-ratio */}
        <div className="card-img-ratio">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              loading="eager"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-muted to-muted/60">
              <span className="text-3xl font-black text-muted-foreground/20 tracking-tight">TT</span>
            </div>
          )}
          {category && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest">
              {category.name}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 gap-2">

          {/* Title — 2 lines fixed via .card-title */}
          <h2 className="card-title text-sm md:text-base group-hover:text-primary transition-colors">
            {title}
          </h2>

          {/* Summary — 2 lines fixed via .card-summary */}
          <p className="card-summary text-xs text-muted-foreground leading-relaxed">
            {summary}
          </p>

          {/* Footer */}
          <div className="mt-auto pt-2 flex items-center gap-2 text-xs text-muted-foreground">
            {publishedAt && (
              <time dateTime={publishedAt} className="font-medium">
                {formatDate(publishedAt)}
              </time>
            )}
            {language === "hi" && (
              <Badge variant="secondary" className="text-[10px] font-semibold ml-auto">
                हिंदी
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}