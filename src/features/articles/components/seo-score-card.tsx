"use client";

import {
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { calculateSeoScore } from "../lib/calculate-seo-score";

type Props = {
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  slug: string;
  featuredImage?: string;
  shortDescription?: string;
  wordCount?: number;
};

export function SeoScoreCard({
  title,
  seoTitle,
  seoDescription,
  slug,
  featuredImage,
  shortDescription,
  wordCount = 0,
}: Props) {
  const {
    score,
    checks,
  } =
    calculateSeoScore(
      {
        title,
        seoTitle,
        seoDescription,
        slug,
        featuredImage,
        shortDescription,
        wordCount,
      },
    );

  function getScoreColor() {
    if (
      score >= 80
    ) {
      return "text-green-600";
    }

    if (
      score >= 50
    ) {
      return "text-yellow-600";
    }

    return "text-red-600";
  }

  function getProgressColor() {
    if (
      score >= 80
    ) {
      return "bg-green-500";
    }

    if (
      score >= 50
    ) {
      return "bg-yellow-500";
    }

    return "bg-red-500";
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">
            SEO Health
          </h3>

          <p className="text-sm text-muted-foreground">
            Improve visibility
          </p>
        </div>

        <div
          className={cn(
            "text-2xl font-bold",
            getScoreColor(),
          )}
        >
          {score}
          /100
        </div>
      </div>

      {/* Progress */}
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-all duration-300",
            getProgressColor(),
          )}
          style={{
            width: `${score}%`,
          }}
        />
      </div>

      {/* Checks */}
      <div className="space-y-3">
        {checks.map(
          (
            check,
          ) => (
            <div
              key={
                check.label
              }
              className="flex items-start gap-3"
            >
              {check.passed ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 text-yellow-500 shrink-0" />
              )}

              <p
                className={cn(
                  "text-sm",
                  check.passed
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {
                  check.label
                }
              </p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}