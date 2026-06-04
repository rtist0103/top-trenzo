"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  categories: Category[];
  /** Slug passed from server for initial highlight (non-article pages) */
  activeSlug?: string;
  /** When true, highlights update by watching article h2s on scroll */
  trackScroll?: boolean;
};

export function ActiveCategoryBar({ categories, activeSlug, trackScroll = false }: Props) {
  const [active, setActive] = useState(activeSlug ?? "");
  const barRef = useRef<HTMLDivElement>(null);

  // Scroll active tab into view in the bar whenever it changes
  useEffect(() => {
    if (!barRef.current || !active) return;
    const el = barRef.current.querySelector<HTMLElement>(`[data-slug="${active}"]`);
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [active]);

  // On article pages, watch the URL hash and IntersectionObserver on headings
  useEffect(() => {
    if (!trackScroll || categories.length === 0) return;

    // Map each category slug to its heading element in the article (if any)
    // Falls back to just using the passed activeSlug if no headings found
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>("article h2[data-category], article h3[data-category]"),
    );

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const slug = (entry.target as HTMLElement).dataset.category ?? "";
            if (slug) setActive(slug);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [trackScroll, categories]);

  if (categories.length === 0) return null;

  return (
    <div className="category-bar" ref={barRef}>
      <div className="container-wrapper">
        <div className="category-bar__inner">
          {categories.map((category) => {
            const isActive = active === category.slug;
            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                data-slug={category.slug}
                onClick={() => setActive(category.slug)}
                className={cn(
                  "category-bar__link",
                  isActive && "category-bar__link--active",
                )}
              >
                {isActive && <span className="category-bar__indicator" />}
                {category.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}