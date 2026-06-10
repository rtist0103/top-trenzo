"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Menu, X, Home, Newspaper, Search, ChevronRight } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";

type Category = { id: string; name: string; slug: string };
type Props = { categories: Category[]; siteName: string; logoUrl?: string | null };

export function MobileNav({ categories, siteName, logoUrl }: Props) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, close]);

  const topLinks = [
    { href: "/",       label: "Home",        icon: Home      },
    { href: "/news",   label: "Latest News", icon: Newspaper },
    { href: "/search", label: "Search",      icon: Search    },
  ];

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="mobile-drawer md:hidden" aria-modal="true" role="dialog">
          {/* Backdrop */}
          <div className="mobile-drawer__backdrop" onClick={close} />

          {/* Panel */}
          <div className="mobile-drawer__panel">

            {/* Header */}
            <div className="mobile-drawer__header">
              <BrandLogo
                logoUrl={logoUrl}
                siteName={siteName}
                variant="default"
                href="/"
                className="pointer-events-auto"
              />
              <button
                onClick={close}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">

              {topLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm font-semibold"
                >
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  {label}
                </Link>
              ))}

              {categories.length > 0 && (
                <p className="px-4 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Topics
                </p>
              )}

              {categories.length > 0 && (
                <div className="grid grid-cols-2 gap-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      onClick={close}
                      className="flex items-center gap-1 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      <ChevronRight className="h-3 w-3 shrink-0 text-primary" />
                      <span className="truncate">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </nav>

            {/* Footer */}
            <div className="mobile-drawer__footer">
              <p className="text-[10px] text-center text-muted-foreground">
                © {new Date().getFullYear()} {siteName} · Trends That Matter
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}