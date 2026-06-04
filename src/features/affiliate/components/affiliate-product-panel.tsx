"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Plus, X, ShoppingBag, ChevronDown, ChevronUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AffiliateProduct } from "@/repositories/affiliate-products.repositories";

type Props = {
  /** All products in the library */
  allProducts: AffiliateProduct[];
  /** IDs already linked to this article */
  initialLinkedIds: string[];
  /** Called whenever the selection changes — parent stores and submits */
  onChange: (orderedIds: string[]) => void;
};

type DraftProduct = Omit<AffiliateProduct, "id" | "created_at" | "updated_at"> & {
  _draft: true;
};

export function AffiliateProductsPanel({
  allProducts,
  initialLinkedIds,
  onChange,
}: Props) {
  const [linkedIds, setLinkedIds] = useState<string[]>(initialLinkedIds);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [draft, setDraft] = useState<Partial<DraftProduct>>({});
  const [saving, setSaving] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");

  const linked = linkedIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is AffiliateProduct => !!p);

  const unlinked = allProducts.filter((p) => !linkedIds.includes(p.id));
  const filtered = unlinked.filter((p) =>
    p.title.toLowerCase().includes(librarySearch.toLowerCase()),
  );

  function updateIds(ids: string[]) {
    setLinkedIds(ids);
    onChange(ids);
  }

  function attach(id: string) {
    if (linkedIds.length >= 5) return;
    updateIds([...linkedIds, id]);
  }

  function detach(id: string) {
    updateIds(linkedIds.filter((i) => i !== id));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...linkedIds];
    const a = next[index - 1];
    const b = next[index];
    if (a === undefined || b === undefined) return;
    next[index - 1] = b;
    next[index] = a;
    updateIds(next);
  }

  function moveDown(index: number) {
    if (index === linkedIds.length - 1) return;
    const next = [...linkedIds];
    const a = next[index];
    const b = next[index + 1];
    if (a === undefined || b === undefined) return;
    next[index] = b;
    next[index + 1] = a;
    updateIds(next);
  }

  async function handleCreateAndAttach() {
    if (!draft.title?.trim() || !draft.buy_url?.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/affiliate-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title.trim(),
          description: draft.description?.trim() || null,
          image_url: draft.image_url?.trim() || null,
          price: draft.price?.trim() || null,
          rating: draft.rating ?? null,
          buy_url: draft.buy_url.trim(),
          badge: draft.badge?.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create product");
      const product: AffiliateProduct = await res.json();
      // Optimistically add to library & attach
      allProducts.push(product);
      attach(product.id);
      setDraft({});
      setShowNewForm(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {linkedIds.length === 0
              ? "No products — leave empty to skip section."
              : `${linkedIds.length} product${linkedIds.length > 1 ? "s" : ""} attached (max 5)`}
          </p>
        </div>
        <div className="flex gap-1.5">
          {linkedIds.length < 5 && (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => { setShowLibrary(!showLibrary); setShowNewForm(false); }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Pick
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => { setShowNewForm(!showNewForm); setShowLibrary(false); }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                New
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Attached products */}
      {linked.length > 0 && (
        <div className="space-y-2">
          {linked.map((product, index) => (
            <div key={product.id} className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2">
              {/* Reorder */}
              <div className="flex flex-col gap-0.5">
                <button title="move-up" type="button" onClick={() => moveUp(index)} disabled={index === 0}
                  className="p-0.5 rounded hover:bg-muted disabled:opacity-30 transition-colors">
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button title="move-down" type="button" onClick={() => moveDown(index)} disabled={index === linked.length - 1}
                  className="p-0.5 rounded hover:bg-muted disabled:opacity-30 transition-colors">
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>

              {/* Thumbnail */}
              <div className="relative h-10 w-10 shrink-0 rounded overflow-hidden bg-muted">
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{product.title}</p>
                {product.price && (
                  <p className="text-[10px] text-primary font-bold">{product.price}</p>
                )}
              </div>

              {/* Remove */}
              <button title="remove" type="button" onClick={() => detach(product.id)}
                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Library picker */}
      {showLibrary && (
        <div className="rounded-lg border bg-card p-3 space-y-2">
          <Input
            placeholder="Search products..."
            value={librarySearch}
            onChange={(e) => setLibrarySearch(e.target.value)}
            className="h-8 text-sm"
          />
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 text-center">
              {unlinked.length === 0 ? "All products already added." : "No products match."}
            </p>
          ) : (
            <div className="space-y-1 max-h-52 overflow-y-auto">
              {filtered.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => { attach(product.id); setShowLibrary(false); setLibrarySearch(""); }}
                  className="w-full flex items-center gap-2 rounded-md p-2 hover:bg-muted transition-colors text-left"
                >
                  <div className="relative h-8 w-8 shrink-0 rounded overflow-hidden bg-muted">
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.title} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBag className="h-3 w-3 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{product.title}</p>
                    {product.price && <p className="text-[10px] text-primary font-bold">{product.price}</p>}
                  </div>
                  <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New product form */}
      {showNewForm && (
        <div className="rounded-lg border bg-card p-3 space-y-3">
          <p className="text-xs font-semibold">New Product</p>
          <div className="space-y-2">
            <Input
              placeholder="Product title *"
              value={draft.title ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              className="h-8 text-sm"
            />
            <Input
              placeholder="Affiliate / Buy URL *"
              type="url"
              value={draft.buy_url ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, buy_url: e.target.value }))}
              className="h-8 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Price (₹999)"
                value={draft.price ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                className="h-8 text-sm"
              />
              <Input
                placeholder="Rating (4.5)"
                type="number"
                min="0" max="5" step="0.1"
                value={draft.rating ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, rating: e.target.value ? Number(e.target.value) : undefined }))}
                className="h-8 text-sm"
              />
            </div>
            <Input
              placeholder="Image URL"
              type="url"
              value={draft.image_url ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, image_url: e.target.value }))}
              className="h-8 text-sm"
            />
            <Input
              placeholder="Badge label (e.g. Best Seller)"
              value={draft.badge ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, badge: e.target.value }))}
              className="h-8 text-sm"
            />
            <Textarea
              placeholder="Short description"
              value={draft.description ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              rows={2}
              className="resize-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setShowNewForm(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCreateAndAttach}
              disabled={saving || !draft.title?.trim() || !draft.buy_url?.trim()}
              className="flex-1"
            >
              {saving ? "Saving…" : "Save & Attach"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}