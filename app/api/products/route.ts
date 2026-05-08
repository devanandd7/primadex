import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/mongodb";
import Product from "@/lib/models/Product";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? "all";
    const featured = searchParams.get("featured") === "true";

    let query: any = { isActive: true };
    if (category !== "all") {
      query.category = category;
    }
    if (featured) {
      query.isFeatured = true;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ products });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    // Basic validation
    if (!body?.name || !body?.description || !body?.category || !body?.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const product = await Product.create({
      name: body.name,
      description: body.description,
      longDescription: body.longDescription,
      category: body.category,
      type: body.type,
      price: Number(body.price || 0),
      currency: body.currency || "INR",
      images: body.images || [],
      videoUrl: body.videoUrl,
      features: body.features || [],
      techStack: body.techStack || [],
      badge: body.badge,
      isFeatured: Boolean(body.isFeatured),
      isActive: body.isActive !== false,
      downloadUrl: body.downloadUrl,
      demoUrl: body.demoUrl,
      docsUrl: body.docsUrl,
      razorpayPlanId: body.razorpayPlanId,
      
      // New category-specific fields
      security: body.security,
      support: body.support,
      onboarding: body.onboarding,
      integrations: body.integrations || [],
      fileFormats: body.fileFormats || [],
      compatibility: body.compatibility,
      techSpecs: body.techSpecs,
      license: body.license,
      blogPost: body.blogPost,
    });

    return NextResponse.json({ success: true, product });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body._id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    // Prepare update payload
    const updatePayload = {
      ...body,
      price: Number(body.price || 0),
    };

    const updated = await Product.findByIdAndUpdate(body._id, updatePayload, { new: true });
    return NextResponse.json({ success: true, product: updated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


