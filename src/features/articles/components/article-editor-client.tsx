"use client";

import type {
  Block,
  PartialBlock,
} from "@blocknote/core";

import "@blocknote/core/fonts/inter.css";

import {
  BlockNoteView,
} from "@blocknote/mantine";

import "@blocknote/mantine/style.css";

import {
  useCreateBlockNote,
} from "@blocknote/react";

import {
  useTheme,
} from "next-themes";

import {
  useMemo,
  useState,
} from "react";

import "@/styles/blocknote.css";

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

export function ArticleEditorClient({
  onChange,
  onStatsChange,
  initialContent,
}: Props) {
  const {
    resolvedTheme,
  } = useTheme();

  const safeContent =
    Array.isArray(
      initialContent,
    ) &&
    initialContent.length >
      0
      ? (
          initialContent as PartialBlock[]
        )
      : [
          {
            type:
              "paragraph",
          },
        ];

  const editor =
    useCreateBlockNote({
      initialContent:
        safeContent,
    });

  const [
    saveStatus,
    setSaveStatus,
  ] = useState(
    "Saved",
  );

  /* --------------------------
     Content stats
  -------------------------- */

  const stats =
    useMemo(() => {
      const text =
        editor.document
          .map(
            (
              block: Block,
            ) => {
              if (
                !Array.isArray(
                  block.content,
                )
              ) {
                return "";
              }

              return block.content
                .map(
                  (
                    item,
                  ) => {
                    if (
                      typeof item ===
                        "object" &&
                      item &&
                      "text" in
                        item
                    ) {
                      return String(
                        item.text,
                      );
                    }

                    return "";
                  },
                )
                .join("");
            },
          )
          .join(" ");

      return {
        wordCount:
          text
            .trim()
            .split(/\s+/)
            .filter(
              Boolean,
            ).length,

        characterCount:
          text.length,
      };
    }, [
      editor.document,
    ]);

  const {
    wordCount,
    characterCount,
  } = stats;

  /* --------------------------
     Editor change
  -------------------------- */

  const handleChange =
    () => {
      const json =
        editor.document;

      onChange(
        json,
      );

      onStatsChange?.(
        {
          wordCount,
          characterCount,
        },
      );

      setSaveStatus(
        "Saving...",
      );

      setTimeout(
        () => {
          setSaveStatus(
            "Saved",
          );
        },
        1000,
      );
    };

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-sm">
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-muted-foreground">
              Words
            </p>

            <p className="text-xl font-bold">
              {
                wordCount
              }
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Characters
            </p>

            <p className="text-xl font-bold">
              {
                characterCount
              }
            </p>
          </div>
        </div>

        <span className="text-sm text-muted-foreground">
          {
            saveStatus
          }
        </span>
      </div>

      {/* Editor */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <BlockNoteView
          editor={
            editor
          }
          onChange={
            handleChange
          }
          className="min-h-150"
          theme={
            resolvedTheme ===
            "dark"
              ? "dark"
              : "light"
          }
          slashMenu
        />
      </div>
    </div>
  );
}