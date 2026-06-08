"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Trash2, ChevronUp, ChevronDown, Plus,
  Search, Star, TrendingUp, ImageOff, Loader2, Radio,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FeaturedSlot } from "@/repositories/featured-slots.repositories";
import type { PublicArticle } from "@/repositories/article.repositories";

type SlotKey = "hero" | "trending" | "live";

type Props = {
  heroSlots: FeaturedSlot[];
  trendingSlots: FeaturedSlot[];
  liveSlots: FeaturedSlot[];
  allArticles: PublicArticle[];
  onAdd: (formData: FormData) => Promise<void>;
  onRemove: (formData: FormData) => Promise<void>;
  onReorder: (formData: FormData) => Promise<void>;
};

const LIMITS: Record<SlotKey, number> = { hero: 5, trending: 4, live: 10 };

// ── Article picker ────────────────────────────────────────────

function ArticlePicker({
  articles,
  usedIds,
  slot,
  slotCount,
  onAdd,
}: {
  articles: PublicArticle[];
  usedIds: Set<string>;
  slot: SlotKey;
  slotCount: number;
  onAdd: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const [addingId, setAddingId] = useState<string | null>(null);

  const limit = LIMITS[slot];
  const full = slotCount >= limit;

  const filtered = articles
    .filter((a) => !usedIds.has(a.id))
    .filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));

  function handleAdd(article: PublicArticle) {
    setAddingId(article.id);
    const formData = new FormData();
    formData.set("slot", slot);
    formData.set("article_id", article.id);
    formData.set("sort_order", String(slotCount));
    startTransition(async () => {
      await onAdd(formData);
      router.refresh();
      setAddingId(null);
      setOpen(false);
      setSearch("");
    });
  }

  if (!open) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={full || pending}
        onClick={() => setOpen(true)}
        className="w-full mt-2"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        {full ? `Max ${limit} articles` : "Add Article"}
      </Button>
    );
  }

  return (
    <div className="rounded-xl border bg-muted/30 p-4 space-y-3 mt-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Pick an article</p>
        <button
          type="button"
          onClick={() => { setOpen(false); setSearch(""); }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
          autoFocus
        />
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            {articles.filter((a) => !usedIds.has(a.id)).length === 0
              ? "All published articles are already added."
              : "No articles match."}
          </p>
        ) : (
          filtered.map((article) => {
            const isAdding = addingId === article.id && pending;
            return (
              <button
                key={article.id}
                type="button"
                disabled={pending}
                onClick={() => handleAdd(article)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left disabled:opacity-60"
              >
                <div className="relative h-10 w-14 shrink-0 rounded overflow-hidden bg-muted">
                  {article.featured_image ? (
                    <Image
                      src={article.featured_image}
                      alt={article.title}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageOff className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold line-clamp-2 leading-snug">
                    {article.title}
                  </p>
                  {article.category && (
                    <p className="text-[10px] text-primary font-bold uppercase mt-0.5">
                      {article.category.name}
                    </p>
                  )}
                </div>
                {isAdding ? (
                  <Loader2 className="h-4 w-4 shrink-0 text-muted-foreground animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Slot row ──────────────────────────────────────────────────

function SlotRow({
  slot,
  index,
  total,
  onRemove,
  onReorder,
}: {
  slot: FeaturedSlot;
  index: number;
  total: number;
  onRemove: (formData: FormData) => Promise<void>;
  onReorder: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function callAction(
    action: (formData: FormData) => Promise<void>,
    fields: Record<string, string>,
  ) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);
    startTransition(async () => {
      await action(fd);
      router.refresh();
    });
  }

  const catName = slot.article.categories
    ? Array.isArray(slot.article.categories)
      ? slot.article.categories[0]?.name
      : (slot.article.categories as { name: string }).name
    : null;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border bg-background transition-colors ${pending ? "opacity-50" : "hover:border-primary/30"}`}>
      <span className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground">
        {index + 1}
      </span>

      <div className="relative h-12 w-16 shrink-0 rounded overflow-hidden bg-muted">
        {slot.article.featured_image ? (
          <Image
            src={slot.article.featured_image}
            alt={slot.article.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageOff className="h-4 w-4 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold line-clamp-1">{slot.article.title}</p>
        {catName && (
          <p className="text-[10px] font-bold text-primary uppercase mt-0.5">{catName}</p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          disabled={index === 0 || pending}
          onClick={() => callAction(onReorder, { id: slot.id, sort_order: String(index - 1) })}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted transition-colors disabled:opacity-30"
          aria-label="Move up"
        >
          <ChevronUp className="h-4 w-4" />
        </button>

        <button
          type="button"
          disabled={index === total - 1 || pending}
          onClick={() => callAction(onReorder, { id: slot.id, sort_order: String(index + 1) })}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted transition-colors disabled:opacity-30"
          aria-label="Move down"
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() => callAction(onRemove, { id: slot.id })}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
          aria-label="Remove"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

// ── Section panel ─────────────────────────────────────────────

function SectionPanel({
  title,
  description,
  icon: Icon,
  slots,
  slot,
  allArticles,
  onAdd,
  onRemove,
  onReorder,
}: {
  title: string;
  description: string;
  icon: typeof Star;
  slots: FeaturedSlot[];
  slot: SlotKey;
  allArticles: PublicArticle[];
  onAdd: (formData: FormData) => Promise<void>;
  onRemove: (formData: FormData) => Promise<void>;
  onReorder: (formData: FormData) => Promise<void>;
}) {
  const usedIds = new Set(slots.map((s) => s.article_id));
  const limit = LIMITS[slot];

  return (
    <Card>
      <div className="p-5 border-b flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">{title}</h2>
            <Badge variant="secondary" className="text-xs">
              {slots.length} / {limit}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>

      <div className="p-5 space-y-2">
        {slots.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No articles pinned yet. Add one below.
          </p>
        ) : (
          slots.map((s, i) => (
            <SlotRow
              key={s.id}
              slot={s}
              index={i}
              total={slots.length}
              onRemove={onRemove}
              onReorder={onReorder}
            />
          ))
        )}

        <ArticlePicker
          articles={allArticles}
          usedIds={usedIds}
          slot={slot}
          slotCount={slots.length}
          onAdd={onAdd}
        />
      </div>
    </Card>
  );
}

// ── Main export ───────────────────────────────────────────────

export function HomepageClient({
  heroSlots,
  trendingSlots,
  liveSlots,
  allArticles,
  onAdd,
  onRemove,
  onReorder,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionPanel
          title="Hero Carousel"
          description={`Up to ${LIMITS.hero} articles. First article shows first in the carousel.`}
          icon={Star}
          slots={heroSlots}
          slot="hero"
          allArticles={allArticles}
          onAdd={onAdd}
          onRemove={onRemove}
          onReorder={onReorder}
        />
        <SectionPanel
          title="Trending Sidebar"
          description={`Up to ${LIMITS.trending} articles shown in the Trending Now widget.`}
          icon={TrendingUp}
          slots={trendingSlots}
          slot="trending"
          allArticles={allArticles}
          onAdd={onAdd}
          onRemove={onRemove}
          onReorder={onReorder}
        />
      </div>

      <SectionPanel
        title="Live Ticker Banner"
        description={`Up to ${LIMITS.live} articles shown scrolling in the top live ticker.`}
        icon={Radio}
        slots={liveSlots}
        slot="live"
        allArticles={allArticles}
        onAdd={onAdd}
        onRemove={onRemove}
        onReorder={onReorder}
      />
    </div>
  );
}