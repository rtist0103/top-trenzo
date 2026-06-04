"use server";

import { revalidateTag }
from "next/cache";

import { createClient }
from "@/lib/supabase/server";

export async function saveSettings(
  formData: FormData,
) {
  const supabase =
    await createClient();

  const entries =
    Array.from(
      formData.entries(),
    );

  const rows = entries.map(
    ([key, value]) => ({
      key,
      value: String(value),
    }),
  );

  const { error } =
    await supabase
      .from("site_settings")
      .upsert(rows, {
        onConflict: "key",
      });

  if (error) {
    throw new Error(
      error.message,
    );
  }

  revalidateTag(
    "site_settings",
    "max",
  );

  return {
    success: true,
  };
}