"use client";

import dynamic from "next/dynamic";

import type {
  Block,
  PartialBlock,
} from "@blocknote/core";

type Props = {
  onChange: (
    content: Block[],
  ) => void;

  onStatsChange?: (
    stats: {
      wordCount: number;
      characterCount: number;
    },
  ) => void;

  initialContent?: PartialBlock[];
};

export const ArticleEditor =
  dynamic<Props>(
    () =>
      import(
        "./article-editor-client"
      ).then(
        (mod) =>
          mod.ArticleEditorClient,
      ),
    {
      ssr: false,

      loading: () => (
        <div className="flex min-h-50 items-center justify-center rounded-xl border bg-card">
          Loading editor...
        </div>
      ),
    },
  );