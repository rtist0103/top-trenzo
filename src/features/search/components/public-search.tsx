"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Filter } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  categories: Category[];
  isSidebar?: boolean;
};

export function PublicSearch({ categories, isSidebar = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [showFilters, setShowFilters] = useState(false);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // Reset to page 1 when filters change
    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function clearAllFilters() {
    setSearch("");
    startTransition(() => {
      router.push(pathname);
    });
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentSearch = searchParams.get("search") ?? "";

      if (currentSearch === search.trim()) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      if (!search.trim()) {
        params.delete("search");
      } else {
        params.set("search", search.trim());
      }

      params.delete("page");

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, router, searchParams, pathname]);

  type ActiveFilter = { key: string; label: string };

  const activeFilters: ActiveFilter[] = [
    searchParams.get("search")
      ? { key: "search", label: `"${searchParams.get("search")}"` }
      : null,
    searchParams.get("category")
      ? {
          key: "category",
          label:
            categories.find(c => c.slug === searchParams.get("category"))?.name ??
            "Category",
        }
      : null,
    searchParams.get("language")
      ? { key: "language", label: searchParams.get("language")!.toUpperCase() }
      : null,
  ].filter((f): f is ActiveFilter => f !== null);

  if (isSidebar) {
    return (
      <div className="space-y-6">
        {/* Search Input */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Search Articles</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {search && (
              <button
                title="Clear search"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Categories Filter */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Categories</h3>
          <div className="space-y-2">
            <button
              onClick={() => updateFilter("category", "all")}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                !searchParams.get("category")
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-muted"
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => updateFilter("category", category.slug)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  searchParams.get("category") === category.slug
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "hover:bg-muted"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Language Filter */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Language</h3>
          <div className="space-y-2">
            <button
              onClick={() => updateFilter("language", "all")}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                !searchParams.get("language")
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-muted"
              }`}
            >
              All Languages
            </button>
            <button
              onClick={() => updateFilter("language", "en")}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                searchParams.get("language") === "en"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-muted"
              }`}
            >
              English
            </button>
            <button
              onClick={() => updateFilter("language", "hi")}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                searchParams.get("language") === "hi"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-muted"
              }`}
            >
              हिंदी (Hindi)
            </button>
          </div>
        </div>

        {/* Clear Filters */}
        {activeFilters.length > 0 && (
          <Button
            onClick={clearAllFilters}
            variant="outline"
            className="w-full"
            size="sm"
          >
            Clear All Filters
          </Button>
        )}
      </div>
    );
  }

  // Mobile/Compact View
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {search && (
          <button
            title="Clear search"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Toggle Button */}
      <Button
        onClick={() => setShowFilters(!showFilters)}
        variant="outline"
        size="sm"
        className="w-full md:hidden"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
      </Button>

      {/* Filters Row (Desktop) / Expandable (Mobile) */}
      <div
        className={`flex flex-col gap-3 md:flex-row ${
          showFilters ? "block" : "hidden md:flex"
        }`}
      >
        {/* Category */}
        <Select
          value={searchParams.get("category") ?? "all"}
          onValueChange={(value) => updateFilter("category", value)}
        >
          <SelectTrigger className="w-full md:w-52">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Language */}
        <Select
          value={searchParams.get("language") ?? "all"}
          onValueChange={(value) => updateFilter("language", value)}
        >
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="hi">हिंदी</SelectItem>
          </SelectContent>
        </Select>

        {activeFilters.length > 0 && (
          <Button onClick={clearAllFilters} variant="ghost" size="sm">
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => updateFilter(filter.key, "all")}
            >
              {filter.label}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}