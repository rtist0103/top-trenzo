"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="rounded-xl border-border/80 bg-card/80 backdrop-blur-md hover:bg-accent transition-all"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      <Sun
        suppressHydrationWarning
        className={`h-4 w-4 transition-all ${isDark ? "scale-0 rotate-90" : "scale-100 rotate-0"}`}
        aria-hidden="true"
      />
      <Moon
        suppressHydrationWarning
        className={`absolute h-4 w-4 transition-all ${isDark ? "scale-100 rotate-0" : "scale-0 -rotate-90"}`}
        aria-hidden="true"
      />
    </Button>
  );
}