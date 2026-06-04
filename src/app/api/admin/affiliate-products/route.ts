import { NextRequest, NextResponse } from "next/server";
import { createAffiliateProduct } from "@/repositories/affiliate-products.repositories";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await createAffiliateProduct({
      title: body.title,
      description: body.description ?? null,
      image_url: body.image_url ?? null,
      price: body.price ?? null,
      rating: body.rating ?? null,
      buy_url: body.buy_url,
      badge: body.badge ?? null,
    });
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}