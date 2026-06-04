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
    <div className="relative overflow-hidden rounded-2xl group border bg-black shadow-lg w-full h-full">
      {/* Slides wrapper */}
      <div className="relative min-h-95 md:min-h-125 w-full">
        {articles.map((article, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={article.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 pointer-events-none z-0"
              }`}
            >
              {/* Background Image / Gradient */}
              {article.featured_image ? (
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  priority={idx === 0}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="object-cover opacity-85 group-hover:scale-[1.02] transition-transform duration-8000 ease-out"
                />
              ) : (
                <div className="absolute inset-0 hero-gradient opacity-90" />
              )}

              {/* Rich Overlay Gradient */}
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-black/10 md:from-black/95 md:via-black/50" />

              {/* Content Panel */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white flex flex-col justify-end h-full">
                <div className="max-w-3xl space-y-4">
                  {/* Category badge */}
                  {article.category && (
                    <span className="inline-block bg-primary text-white text-[10px] md:text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-sm shadow-md animate-fade-in">
                      {article.category.name}
                    </span>
                  )}

                  {/* Title */}
                  <Link href={`/news/${article.slug}`} className="block">
                    <h1 className="text-2xl md:text-5xl font-black tracking-tight leading-[1.1] hover:text-primary transition-colors duration-300 line-clamp-3 cursor-pointer">
                      {article.title}
                    </h1>
                  </Link>

                  {/* Summary */}
                  <p className="text-white/80 text-xs md:text-base font-medium line-clamp-2 leading-relaxed max-w-2xl">
                    {article.summary}
                  </p>

                  {/* Date & Read More */}
                  <div className="flex items-center gap-4 pt-2">
                    {article.published_at && (
                      <span className="text-white/60 text-xs flex items-center gap-1.5 font-semibold">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {formatDate(article.published_at)}
                      </span>
                    )}
                    <Link
                      href={`/news/${article.slug}`}
                      className="hidden sm:inline-flex items-center text-xs font-bold text-primary hover:text-white transition-colors gap-1 group/btn"
                    >
                      Read Article
                      <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Chevrons */}
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

      {/* Modern Slide Indicators with Timers */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
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