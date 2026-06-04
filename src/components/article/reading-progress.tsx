"use client";

import { useEffect, useRef } from "react";

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateProgress() {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const total = scrollHeight - clientHeight;
      const pct = total <= 0 ? 0 : Math.round((scrollTop / total) * 100);
      const el = barRef.current;
      if (!el) return;
      el.style.setProperty("--reading-progress", `${pct}%`);
      el.style.opacity = pct > 0 && pct < 100 ? "1" : "0";
    }

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div
      ref={barRef}
      className="reading-progress-bar"
      aria-hidden="true"
    />
  );
}