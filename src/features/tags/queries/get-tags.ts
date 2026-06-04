import {
  createClient,
} from "@/lib/supabase/server";

export type Tag = {
  id: string;

  name: string;

  slug: string;
};

export async function getTags() {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("tags")
      .select(
        "id, name, slug",
      )
      .order(
        "name",
      );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return (
    data ?? []
  ) as Tag[];
}