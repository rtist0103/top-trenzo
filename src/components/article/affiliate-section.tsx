import Image from "next/image";
import { ExternalLink, Star, ShoppingBag } from "lucide-react";

import { getProductsForArticle } from "@/repositories/affiliate-products.repositories";
import type { AffiliateProduct } from "@/repositories/affiliate-products.repositories";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3 w-3 ${
            s <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/20"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  );
}

function ProductCard({ product }: { product: AffiliateProduct }) {
  return (
    <a
      href={product.buy_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:border-primary hover:shadow-md transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground/20" />
          </div>
        )}
        {product.badge && (
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
            {product.badge}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {product.title}
        </p>
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2 flex-wrap">
          <div>
            {product.rating !== null && <StarRating rating={product.rating} />}
            {product.price && (
              <p className="text-sm font-bold text-primary mt-0.5">{product.price}</p>
            )}
          </div>
          <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold border border-primary text-primary px-2.5 py-1 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
            Buy <ExternalLink className="h-2.5 w-2.5" />
          </span>
        </div>
      </div>
    </a>
  );
}

type Props = { articleId: string };

export async function AffiliateSection({ articleId }: Props) {
  const products = await getProductsForArticle(articleId);

  // Renders nothing when no products are linked to this article
  if (products.length === 0) return null;

  return (
    <div className="mt-12 pt-10 border-t">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-1 w-8 rounded bg-primary" />
        <h2 className="text-lg font-bold uppercase tracking-tight">Related Products</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-5 uppercase tracking-wider font-medium">
        Sponsored · Affiliate links
      </p>

      <div className={`grid gap-3 ${
        products.length === 1 ? "grid-cols-1 max-w-xs" :
        products.length === 2 ? "grid-cols-2 max-w-sm" :
        products.length === 3 ? "grid-cols-2 sm:grid-cols-3" :
        "grid-cols-2 sm:grid-cols-4"
      }`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground mt-3">
        * We may earn a commission from affiliate links at no extra cost to you.
      </p>
    </div>
  );
}