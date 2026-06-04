"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type Status =
  | "draft"
  | "review"
  | "published"
  | "archived";

export async function updateArticleStatus(
  id: string,
  status: Status,
) {
  const supabase =
    await createClient();

  const {
    error,
  } = await supabase
    .from(
      "articles",
    )
    .update({
      status,

      published_at:
        status ===
        "published"
          ? new Date().toISOString()
          : null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(
      error.message,
    );
  }

  revalidatePath(
    "/admin/articles",
  );
}