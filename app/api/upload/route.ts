import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const maxDuration = 60; // Increase timeout to 60 seconds

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(`Starting upload for: ${file.name} (${file.size} bytes)`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");
    const fileUri = `data:${file.type};base64,${base64Data}`;

    const result = await cloudinary.uploader.upload(fileUri, {
      folder: "primadex_products",
      resource_type: "auto",
    });

    console.log(`Upload successful: ${result.secure_url}`);
    return NextResponse.json({ url: result.secure_url });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json({ 
      error: "Upload failed", 
      details: error.message || "Check server logs" 
    }, { status: 500 });
  }
}
