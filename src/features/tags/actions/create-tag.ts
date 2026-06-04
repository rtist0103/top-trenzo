"use server";

import slugify from "slugify";

import {
  createClient,
} from "@/lib/supabase/server";

export async function createTag(
  name: string,
) {
  const supabase =
    await createClient();

  const slug =
    slugify(name, {
      lower: true,
      strict: true,
    });

  const {
    data,
    error,
  } =
    await supabase
      .from("tags")
      .insert({
        name,
        slug,
      })
      .select()
      .single();

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return data;
}