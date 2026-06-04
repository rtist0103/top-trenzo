import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Category } from "@/features/categories/queries/get-categories";

type Props = {
  categories: Category[];
  activeSlug?: string;
};

export function CategoryBar({ categories, activeSlug }: Props) {
  if (categories.length === 0) return null;

  return (
    <div className="hidden md:sticky md:top-16 md:z-40 md:block md:border-b md:bg-background/95 md:backdrop-blur">
      <div className="container-wrapper">
        <div className="flex h-11 items-center gap-0 overflow-x-auto scrollbar-none">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={cn(
                "relative shrink-0 px-4 h-full flex items-center text-[13px] font-semibold uppercase tracking-wide transition-colors whitespace-nowrap",
                activeSlug === category.slug
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {activeSlug === category.slug && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}