import Link from "next/link";
import { Search } from "lucide-react";

import { getSettingsMap } from "@/features/settings/repositories/settings.repositories";
import { getAllCategories } from "@/repositories/category.repositories";
import { MobileNav } from "@/components/layout/mobile-nav";
import { BrandLogo } from "@/components/shared/brand-logo";

export default async function Navbar() {
  const [s, categories] = await Promise.all([
    getSettingsMap(),
    getAllCategories(),
  ]);

  const siteName = s.site_name || "TopTrenzo";

  return (
    <header className="sticky top-0 z-50 border-b bg-background shadow-sm">
      <div className="container-wrapper">
        <div className="flex h-14 md:h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MobileNav categories={categories} siteName={siteName} logoUrl={s.logo_url} />
            <BrandLogo logoUrl={s.logo_url} siteName={siteName} variant="default" />
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