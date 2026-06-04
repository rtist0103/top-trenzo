import { EditArticleForm } from "@/features/articles/components/edit-article-form";
import { getArticle } from "@/features/articles/queries/get-article";
import { getCategories } from "@/features/categories/queries/get-categories";
import { getTags } from "@/features/tags/queries/get-tags";
import {
  getAllAffiliateProducts,
  getLinkedProductIds,
} from "@/repositories/affiliate-products.repositories";

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;

  const [article, categories, tags, allAffiliateProducts, initialLinkedProductIds] =
    await Promise.all([
      getArticle(id),
      getCategories(),
      getTags(),
      getAllAffiliateProducts(),
      getLinkedProductIds(id),
    ]);

  return (
    <EditArticleForm
      article={article}
      categories={categories}
      tags={tags}
      allAffiliateProducts={allAffiliateProducts}
      initialLinkedProductIds={initialLinkedProductIds}
    />
  );
}