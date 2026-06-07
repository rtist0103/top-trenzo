"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/format";

type CarouselArticle = {
  id: string;
  title: string;
  summary: string;
  slug: string;
  featured_image?: string | null;
  category?: { name: string; slug: string } | null;
  published_at?: string | null;
};

type Props = {
  articles: CarouselArticle[];
};

const AUTOPLAY_DELAY = 6000; // 6 seconds

export function HeroCarousel({ articles }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);
  const progressTimer = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const dotFillRef = useRef<HTMLSpanElement | null>(null);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % articles.length);
    setProgress(0);
  }, [articles.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + articles.length) % articles.length);
    setProgress(0);
  }, [articles.length]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  }, []);

  // Reset startTime whenever slide changes (triggered by any navigation)
  useEffect(() => {
    startTime.current = Date.now();
  }, [currentIndex]);

  // Autoplay Logic
  useEffect(() => {
    autoplayTimer.current = setInterval(handleNext, AUTOPLAY_DELAY);

    // Smooth progress bar update
    startTime.current = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime.current;
      const currentProgress = Math.min((elapsed / AUTOPLAY_DELAY) * 100, 100);
      setProgress(currentProgress);
      dotFillRef.current?.style.setProperty("--dot-progress", `${currentProgress}%`);
      progressTimer.current = requestAnimationFrame(updateProgress);
    };
    progressTimer.current = requestAnimationFrame(updateProgress);

    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
      if (progressTimer.current) cancelAnimationFrame(progressTimer.current);
    };
  }, [handleNext]);

  if (!articles || articles.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl group border bg-card shadow-lg w-full flex flex-col" style={{ height: "500px" }}>
      {/* Image area - Fixed height */}
      <div className="relative w-full flex-shrink-0 overflow-hidden bg-black" style={{ height: "280px" }}>
        {articles.map((article, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={article.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 pointer-events-none z-0"
              }`}
            >
              {article.featured_image ? (
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  priority={idx === 0}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-8000 ease-out"
                />
              ) : (
                <div className="absolute inset-0 hero-gradient" />
              )}
            </div>
          );
        })}

        {/* Navigation Chevrons - positioned over the image */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary border border-white/10 hover:border-transparent"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary border border-white/10 hover:border-transparent"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </button>
      </div>

      {/* Content area below image - Fixed height with overflow handling */}
      <div className="relative flex-1 min-h-0 overflow-hidden flex flex-col">
        {articles.map((article, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={article.id}
              className={`transition-all duration-500 ease-in-out flex flex-col min-h-0 ${
                isActive ? "opacity-100 relative z-10" : "opacity-0 absolute inset-0 pointer-events-none z-0"
              }`}
            >
              <div className="space-y-2 p-4 md:p-6 flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* Category badge + Date row */}
                <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
                  {article.category && (
                    <span className="inline-block bg-primary text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-sm">
                      {article.category.name}
                    </span>
                  )}
                  {article.published_at && (
                    <span className="text-muted-foreground text-[11px] flex items-center gap-1.5 font-semibold flex-shrink-0">
                      <Clock className="h-3 w-3 text-primary" />
                      {formatDate(article.published_at)}
                    </span>
                  )}
                </div>

                {/* Title */}
                <Link href={`/news/${article.slug}`} className="block flex-shrink-0">
                  <h2 className="text-lg md:text-2xl font-bold tracking-tight leading-snug hover:text-primary transition-colors duration-300 line-clamp-2 cursor-pointer text-foreground">
                    {article.title}
                  </h2>
                </Link>

                {/* Summary */}
                <p className="text-muted-foreground text-xs md:text-sm font-medium line-clamp-2 leading-relaxed max-w-3xl flex-shrink-0">
                  {article.summary}
                </p>

                {/* Read More */}
                <Link
                  href={`/news/${article.slug}`}
                  className="inline-flex items-center text-xs font-bold text-primary hover:text-primary/80 transition-colors gap-1 group/btn pt-0.5 flex-shrink-0"
                >
                  Read Full Article
                  <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide Indicators */}
      <div className="px-4 md:px-6 pb-4 md:pb-5 flex gap-2.5 z-20 flex-shrink-0">
        {articles.map((_, index) => {
          const isSelected = index === currentIndex;
          return (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`carousel-dot${isSelected ? " carousel-dot--active" : ""}`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {isSelected && (
                <span
                  ref={dotFillRef}
                  className="carousel-dot-fill"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}