import {
  createClient,
} from "@/lib/supabase/server";

export type Category =
  {
    id: string;

    name: string;

    slug: string;
  };

export async function getCategories() {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "categories",
    )
    .select(
      `
      id,
      name,
      slug
    `,
    )
    .order(
      "name",
      {
        ascending:
          true,
      },
    );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return (
    data ?? []
  ) as Category[];
}