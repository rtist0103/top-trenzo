import { unstable_cache } from "next/cache";

import { supabaseAdmin }
from "@/lib/supabase/admin";

import type {
  SiteSetting,
  SettingsMap,
} from "../types/settings.types";

async function fetchSettings() {
  const { data, error } =
    await supabaseAdmin
      .from("site_settings")
      .select("*")
      .order("category");

  if (error) {
    throw new Error(error.message);
  }

  return (data ??
    []) as SiteSetting[];
}

export const getSiteSettings =
  unstable_cache(
    fetchSettings,
    ["site_settings"],
    {
      revalidate: 300,
      tags: ["site_settings"],
    },
  );

export async function getSettingsMap():
Promise<SettingsMap> {
  const settings =
    await getSiteSettings();

  return settings.reduce(
    (acc, item) => {
      acc[item.key] =
        item.value ?? "";
      return acc;
    },
    {} as SettingsMap,
  );
}