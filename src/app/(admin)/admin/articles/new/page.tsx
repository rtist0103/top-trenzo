import {
  getCategories,
} from "@/features/categories/queries/get-categories";

import {
  NewArticleForm,
} from "@/features/articles/components/new-article-form";

import { getTags } from "@/features/tags/queries/get-tags";

export default async function NewArticlePage() {
  const categories =
    await getCategories();
  
  const tags =
    await getTags();

  return (
    <NewArticleForm
      categories={
        categories
      }
      tags={tags}
    />
  );
}