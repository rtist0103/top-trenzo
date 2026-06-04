import type {
  PartialBlock,
} from "@blocknote/core";

export type ArticleStatus =
  | "draft"
  | "review"
  | "published"
  | "archived";

export type Article = {
  id: string;

  title: string;

  slug: string;

  short_description: string;

  content: PartialBlock[];

  summary: string;

  featured_image?:
    | string
    | null;

  language?:
    | "en"
    | "hi"
    | null;

  status?:
    | ArticleStatus
    | null;

  source_name:
    | string
    | null;

  source_url:
    | string
    | null;

  youtube_video_url?:
    | string
    | null;

  seo_title?:
    | string
    | null;

  seo_description?:
    | string
    | null;

  published_at?:
    | string
    | null;

  category_id?:
    | string
    | null;

  created_by?:
    | string
    | null;

  created_at: string;

  updated_at?:
    | string
    | null;

  author_id?:
    | string
    | null;
};

export type ArticleListItem = {
  id: string;

  title: string;

  slug: string;

  status:
    | ArticleStatus
    | null;

  language:
    | "en"
    | "hi"
    | null;

  created_at: string;

  short_description: string;

  category?:
  {
        name: string;
  } | null;
};