import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getProductById } from "@/lib/mock-products";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const product = getProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

