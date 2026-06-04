import Navbar from "@/components/layout/navbar";
import { ActiveCategoryBar } from "@/components/layout/active-category-bar";
import PublicFooter from "@/components/layout/public-footer";
import { getAllCategories } from "@/repositories/category.repositories";

type Props = {
  children: React.ReactNode;
  activeCategory?: string;
};

export async function PublicLayout({ children, activeCategory }: Props) {
  const categories = await getAllCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <ActiveCategoryBar
        categories={categories}
        activeSlug={activeCategory}
      />
      <main className="container-wrapper flex-1 py-6 md:py-8">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}