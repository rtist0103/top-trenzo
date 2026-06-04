"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function deleteArticle(
  id: string,
) {
  const supabase =
    await createClient();

  const { error } =
    await supabase
      .from("articles")
      .delete()
      .eq("id", id);

  if (error) {
    console.error(
      error,
    );

    throw new Error(
      error.message,
    );
  }

  revalidatePath(
    "/admin/articles",
  );
}