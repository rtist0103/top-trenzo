"use server";

import { revalidatePath } from "next/cache";
import { LayoutDashboard } from "lucide-react";

import {
  getFeaturedSlots,
  addFeaturedSlot,
  removeFeaturedSlot,
  reorderFeaturedSlot,
} from "@/repositories/featured-slots.repositories";
import { getPublishedArticles } from "@/repositories/article.repositories";
import { HomepageClient } from "@/features/homepage/components/homepage-client";

// ── Server Actions ────────────────────────────────────────────

async function actionAdd(formData: FormData) {
  "use server";
  const slot = formData.get("slot") as "hero" | "trending";
  const articleId = formData.get("article_id") as string;
  const sortOrder = Number(formData.get("sort_order") ?? 99);
  if (!slot || !articleId) return;
  await addFeaturedSlot(slot, articleId, sortOrder);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

async function actionRemove(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await removeFeaturedSlot(id);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

async function actionReorder(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const sortOrder = Number(formData.get("sort_order"));
  await reorderFeaturedSlot(id, sortOrder);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

// ── Page ─────────────────────────────────────────────────────

export default async function HomepagePage() {
  const [heroSlots, trendingSlots, allArticles] = await Promise.all([
    getFeaturedSlots("hero"),
    getFeaturedSlots("trending"),
    getPublishedArticles({ limit: 100 }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          Homepage Sections
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Control which articles appear in the Hero carousel and Trending sidebar.
          Changes go live immediately.
        </p>
      </div>

      <HomepageClient
        heroSlots={heroSlots}
        trendingSlots={trendingSlots}
        allArticles={allArticles}
        onAdd={actionAdd}
        onRemove={actionRemove}
        onReorder={actionReorder}
      />
    </div>
  );
}