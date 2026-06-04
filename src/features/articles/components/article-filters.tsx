"use client";

import { useEffect, useState, useTransition } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = {
  id: string;
  name: string;
};

type Props = {
  categories: Category[];
};

export function ArticlesFilter({ categories }: Props) {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    startTransition(() => {
      router.push(`/admin/articles?${params.toString()}`);
    });
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentSearch = searchParams.get("search") ?? "";

      // prevent useless re-search
      if (currentSearch === search.trim()) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      if (!search.trim()) {
        params.delete("search");
      } else {
        params.set("search", search.trim());
      }

      startTransition(() => {
        router.push(`/admin/articles?${params.toString()}`);
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, router, searchParams]);

  return (
    <div
      className="
        flex
        flex-col
        gap-3
        rounded-lg
        border
        p-4
        md:flex-row
      "
    >
      {/* Search */}
      <Input
        placeholder="Search article..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="md:max-w-sm"
      />

      {/* Category */}
      <Select
        defaultValue={searchParams.get("category") ?? "all"}
        onValueChange={(value) => updateFilter("category", value)}
      >
        <SelectTrigger className="w-full md:w-52">
          <SelectValue placeholder="Category" />
        </SelectTrigger>

        <SelectContent className="bg-background border shadow-md z-50">
          <SelectItem value="all">All Categories</SelectItem>

          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select
        defaultValue={searchParams.get("status") ?? "all"}
        onValueChange={(value) => updateFilter("status", value)}
      >
        <SelectTrigger className="w-full md:w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent className="bg-background border shadow-md z-50">
          <SelectItem value="all">All Status</SelectItem>

          <SelectItem value="draft">Draft</SelectItem>

          <SelectItem value="review">Review</SelectItem>

          <SelectItem value="published">Published</SelectItem>

          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      {/* Language */}
      <Select
        defaultValue={searchParams.get("language") ?? "all"}
        onValueChange={(value) => updateFilter("language", value)}
      >
        <SelectTrigger className="w-full md:w-44">
          <SelectValue placeholder="Language" />
        </SelectTrigger>

        <SelectContent className="bg-background border shadow-md z-50">
          <SelectItem value="all">All Languages</SelectItem>

          <SelectItem value="en">English</SelectItem>

          <SelectItem value="hi">Hindi</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
