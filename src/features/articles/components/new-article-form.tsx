"use client";

import slugify from "slugify";
import { toast } from "sonner";
import { ZodError } from "zod";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { ImageUpload } from "@/components/shared/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createArticle } from "@/features/articles/actions/create-article";
import { ArticleEditor } from "@/features/articles/components/article-editor";
import type { Category } from "@/features/categories/queries/get-categories";
import { TagsSelector } from "@/features/tags/components/tag-selector";
import { Tag } from "@/features/tags/queries/get-tags";

import { SeoScoreCard } from "./seo-score-card";

type Props = {
  categories: Category[];
  tags: Tag[];
};

export function NewArticleForm({ categories, tags }: Props) {
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState<unknown>([]);
  const [categoryId, setCategoryId] = useState("");
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);

  const slug = slugify(title, { lower: true, strict: true });

  const router = useRouter();

  async function handleSubmit() {
    setError(null);

    try {
      setIsSubmitting(true);

      const result = await createArticle({
        title,
        slug,
        shortDescription,
        content,
        categoryId,
        tagIds: selectedTagIds,
        language,
        sourceName,
        sourceUrl,
        featuredImage,
        youtubeVideoUrl,
        seoTitle,
        seoDescription,
      });

      if (result?.success) {
        toast.success("Article saved successfully");

        setTimeout(() => {
          router.push("/admin/articles");
        }, 1000);
      }
    } catch (err) {
      let message = "Something went wrong.";

      if (err instanceof ZodError) {
        message = err.issues[0]?.message ?? "Validation failed";
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">New Article</h1>

          <p className="text-muted-foreground">Create a new article</p>
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Article"}
        </Button>
      </div>

      {/* Layout */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* LEFT COLUMN */}
        <div className="min-w-0 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label>Title</Label>

            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
            />
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <Label>Short Description</Label>

            <textarea
              className="min-h-30 w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Brief summary for quick reading"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
          </div>

          {/* Editor */}
          <div className="space-y-2">
            <Label>Content</Label>

            <ArticleEditor
              onChange={setContent}
              onStatsChange={(stats) => setWordCount(stats.wordCount)}
            />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-5 lg:sticky lg:top-6 lg:h-fit">
          {/* Publishing */}
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
            <h3 className="font-semibold">Publishing</h3>

            {/* Language */}
            <div className="space-y-2">
              <Label>Language</Label>

              <Select
                value={language}
                onValueChange={(value) => setLanguage(value as "en" | "hi")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="z-50 border bg-popover shadow-md">
                  <SelectItem value="en">English</SelectItem>

                  <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Organization */}
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
            <h3 className="font-semibold">Organization</h3>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>

              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>

                <SelectContent className="z-50 border bg-popover shadow-md">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>

              <TagsSelector
                tags={tags}
                selectedTagIds={selectedTagIds}
                onChange={setSelectedTagIds}
              />
            </div>
          </div>

          {/* Media */}
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
            <h3 className="font-semibold">Media</h3>

            <div className="space-y-2">
              <Label>Featured Image</Label>

              <ImageUpload value={featuredImage} onChange={setFeaturedImage} />
            </div>
          </div>

          {/* SEO Score */}
          <SeoScoreCard
            title={title}
            seoTitle={seoTitle}
            seoDescription={seoDescription}
            slug={slug}
            featuredImage={featuredImage}
            shortDescription={shortDescription}
            wordCount={wordCount}
          />

          {/* SEO */}
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
            <h3 className="font-semibold">SEO</h3>

            <div className="space-y-2">
              <Label>Slug</Label>

              <Input value={slug} disabled />
            </div>

            <div className="space-y-2">
              <Label>SEO Title</Label>

              <p className="text-xs text-muted-foreground">
                Leave empty to use article title.
              </p>

              <Input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Optional override"
              />
            </div>

            <div className="space-y-2">
              <Label>Meta Description</Label>

              <p className="text-xs text-muted-foreground">
                Leave empty to auto-generate from short description.
              </p>

              <textarea
                className="min-h-25 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Optional override"
              />
            </div>
          </div>

          {/* Source */}
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
            <h3 className="font-semibold">Source</h3>

            <Input
              placeholder="Source Name"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
            />

            <Input
              placeholder="Source URL"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />

            <Input
              placeholder="YouTube URL"
              value={youtubeVideoUrl}
              onChange={(e) => setYoutubeVideoUrl(e.target.value)}
            />
          </div>

          {/* Error */}
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
