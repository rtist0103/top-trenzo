"use client";

import { PartialBlock } from "@blocknote/core";
import slugify from "slugify";
import { toast } from "sonner";
import { ZodError } from "zod";
import { useState } from "react";

import { ImageUpload } from "@/components/shared/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { updateArticle } from "@/features/articles/actions/update-article";
import { ArticleEditor } from "@/features/articles/components/article-editor";
import type { Category } from "@/features/categories/queries/get-categories";
import { TagsSelector } from "@/features/tags/components/tag-selector";
import type { Tag } from "@/features/tags/queries/get-tags";
import { AffiliateProductsPanel } from "@/features/affiliate/components/affiliate-product-panel";
import type { AffiliateProduct } from "@/repositories/affiliate-products.repositories";

import type { Article } from "../types/article";
import { SeoScoreCard } from "./seo-score-card";

type Props = {
  article: Article & { article_tags?: { tag_id: string }[] };
  categories: Category[];
  tags: Tag[];
  allAffiliateProducts: AffiliateProduct[];
  initialLinkedProductIds: string[];
};

export function EditArticleForm({
  article, categories, tags, allAffiliateProducts, initialLinkedProductIds,
}: Props) {
  const [title, setTitle] = useState(article.title);
  const [shortDescription, setShortDescription] = useState(article.short_description);
  const [content, setContent] = useState<PartialBlock[]>(
    Array.isArray(article.content) ? (article.content as PartialBlock[]) : [{ type: "paragraph" }],
  );
  const [categoryId, setCategoryId] = useState(article.category_id ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    article.article_tags?.map((t) => t.tag_id) ?? [],
  );
  const [language, setLanguage] = useState<"en" | "hi">(article.language === "hi" ? "hi" : "en");
  const [sourceName, setSourceName] = useState(article.source_name ?? "");
  const [sourceUrl, setSourceUrl] = useState(article.source_url ?? "");
  const [featuredImage, setFeaturedImage] = useState(article.featured_image ?? "");
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState(article.youtube_video_url ?? "");
  const [seoTitle, setSeoTitle] = useState(article.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(article.seo_description ?? "");
  const [affiliateProductIds, setAffiliateProductIds] = useState<string[]>(initialLinkedProductIds);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);

  const slug = slugify(title, { lower: true, strict: true });

  async function handleSubmit() {
    setError(null);
    try {
      setIsSubmitting(true);
      await updateArticle({
        id: article.id, title, slug, shortDescription, content, categoryId,
        tagIds: selectedTagIds, affiliateProductIds, language, sourceName, sourceUrl,
        featuredImage, youtubeVideoUrl, seoTitle, seoDescription,
      });
      toast.success("Article updated successfully");
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.issues[0]?.message ?? "Validation failed";
        setError(message); toast.error(message);
      } else if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
        setError(err.message); toast.error(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Article</h1>
          <p className="text-muted-foreground">Update article details</p>
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Article"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* LEFT */}
        <div className="min-w-0 space-y-6">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Short Description</Label>
            <textarea
              aria-label="Short Description"
              className="min-h-30 w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <ArticleEditor
              initialContent={content}
              onChange={setContent}
              onStatsChange={(stats) => setWordCount(stats.wordCount)}
            />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-5 lg:sticky lg:top-6 lg:h-fit">
          {/* Publishing */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="font-semibold">Publishing</h3>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as "en" | "hi")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="z-50 border bg-popover shadow-md">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Organization */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="font-semibold">Organization</h3>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent className="z-50 border bg-popover shadow-md">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <TagsSelector tags={tags} selectedTagIds={selectedTagIds} onChange={setSelectedTagIds} />
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="font-semibold">Media</h3>
            <div className="space-y-2">
              <Label>Featured Image</Label>
              <ImageUpload value={featuredImage} onChange={setFeaturedImage} />
            </div>
          </div>

          {/* ── Affiliate Products ── */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <div>
              <h3 className="font-semibold">Affiliate Products</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add up to 5 products. Shown below the article only when products are attached.
              </p>
            </div>
            <AffiliateProductsPanel
              allProducts={allAffiliateProducts}
              initialLinkedIds={affiliateProductIds}
              onChange={setAffiliateProductIds}
            />
          </div>

          {/* SEO Score */}
          <SeoScoreCard
            title={title} seoTitle={seoTitle} seoDescription={seoDescription}
            slug={slug} featuredImage={featuredImage}
            shortDescription={shortDescription} wordCount={wordCount}
          />

          {/* SEO */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="font-semibold">SEO</h3>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={slug} disabled />
            </div>
            <div className="space-y-2">
              <Label>SEO Title</Label>
              <p className="text-xs text-muted-foreground">Leave empty to use article title.</p>
              <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Optional override" />
            </div>
            <div className="space-y-2">
              <Label>Meta Description</Label>
              <p className="text-xs text-muted-foreground">Leave empty to auto-generate.</p>
              <textarea
                className="min-h-25 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Optional override"
              />
            </div>
          </div>

          {/* Source */}
          <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="font-semibold">Source</h3>
            <Input placeholder="Source Name" value={sourceName} onChange={(e) => setSourceName(e.target.value)} />
            <Input placeholder="Source URL" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
            <Input placeholder="YouTube URL" value={youtubeVideoUrl} onChange={(e) => setYoutubeVideoUrl(e.target.value)} />
          </div>

          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}