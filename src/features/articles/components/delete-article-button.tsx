"use client";

import { useTransition } from "react";

import {
  Button,
} from "@/components/ui/button";

import {
  deleteArticle,
} from "@/features/articles/actions/delete-article";

type Props = {
  articleId: string;
};

export function DeleteArticleButton({
  articleId,
}: Props) {
  const [
    isPending,
    startTransition,
  ] = useTransition();

  function handleDelete() {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this article?",
      );

    if (!confirmed) {
      return;
    }

    startTransition(
      async () => {
        await deleteArticle(
          articleId,
        );
      },
    );
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={
        handleDelete
      }
      disabled={
        isPending
      }
    >
      {isPending
        ? "Deleting..."
        : "Delete"}
    </Button>
  );
}