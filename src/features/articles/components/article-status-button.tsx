"use client";

import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  updateArticleStatus,
} from "@/features/articles/actions/update-article-status";

import type {
  ArticleStatus,
} from "@/features/articles/types/article";

type Props = {
  articleId: string;

  status:
    | ArticleStatus
    | null;
};

const statusStyles = {
  draft:
    "bg-muted text-muted-foreground",

  review:
    "bg-yellow-100 text-yellow-700",

  published:
    "bg-green-100 text-green-700",

  archived:
    "bg-red-100 text-red-700",
};

export function ArticleStatusButton({
  articleId,
  status,
}: Props) {
  const [
    isPending,
    startTransition,
  ] = useTransition();

  function handleChange(
    value: string,
  ) {
    startTransition(
      async () => {
        await updateArticleStatus(
          articleId,
          value as ArticleStatus,
        );
      },
    );
  }

  return (
    <Select
      value={
        status ??
        "draft"
      }
      onValueChange={
        handleChange
      }
      disabled={
        isPending
      }
    >
      <SelectTrigger
        className={`
          w-37.5
          capitalize
          border-none
          shadow-none
          ${
            status
              ? statusStyles[
                  status
                ]
              : statusStyles.draft
          }
        `}
      >
        <SelectValue />
      </SelectTrigger>

      <SelectContent className=" bg-popover border shadow-md z-50">
        <SelectItem value="draft" className="cursor-pointer">
          Draft
        </SelectItem>

        <SelectItem value="review" className="cursor-pointer">
          Review
        </SelectItem>

        <SelectItem value="published" className="cursor-pointer">
          Published
        </SelectItem>

        <SelectItem value="archived" className="cursor-pointer">
          Archived
        </SelectItem>
      </SelectContent>
    </Select>
  );
}