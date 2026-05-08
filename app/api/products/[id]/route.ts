import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Product from "@/lib/models/Product";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;
    
    const product = await Product.findById(id).lean();
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("Product fetch error:", error);
    return NextResponse.json({ error: "Invalid product ID or Server error" }, { status: 500 });
  }
}
