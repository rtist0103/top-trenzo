import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";

import { getSettingsMap } from "@/features/settings/repositories/settings.repositories";
import { getAllCategories } from "@/repositories/category.repositories";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function Navbar() {
  const [s, categories] = await Promise.all([
    getSettingsMap(),
    getAllCategories(),
  ]);

  const logo = s.logo_url || "";
  const siteName = s.site_name || "TopTrenzo";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="container-wrapper">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MobileNav categories={categories} siteName={siteName} />
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              {logo ? (
                <Image
                  src={logo}
                  alt={siteName}
                  width={150}
                  height={36}
                  className="object-contain h-9 w-auto"
                  priority
                />
              ) : (
                <div>
                  <p className="text-xl font-bold tracking-tight leading-none">
                    <span>TOP</span>
                    <span className="text-primary">TRENZO</span>
                  </p>
                  <p className="text-[9px] tracking-[0.2em] text-muted-foreground uppercase mt-0.5">
                    Trends That Matter
                  </p>
                </div>
              )}
            </Link>
          </div>

          <div className="hidden md:flex" />

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/search"
              className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}