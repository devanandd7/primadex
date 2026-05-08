import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import clientPromise from "@/lib/mongodb-client";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  
  // Security: Check if user is admin
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
  if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const client = await clientPromise;
    const db = client.db();

    const config = {
      appId: data.appId || "teachboard",
      currentVersion: data.currentVersion,
      downloadUrl: data.downloadUrl,
      updateInfo: data.updateInfo,
      isHardUpdate: data.isHardUpdate,
      isActive: data.isActive,
      lastUpdated: new Date(),
    };

    await db.collection("app_configs").updateOne(
      { appId: config.appId },
      { $set: config },
      { upsert: true }
    );

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("Config update error:", error);
    return NextResponse.json({ error: "Failed to update configuration" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("appId") || "teachboard";
    
    const client = await clientPromise;
    const db = client.db();
    
    const config = await db.collection("app_configs").findOne({ appId });
    
    return NextResponse.json(config || {});
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch configuration" }, { status: 500 });
  }
}
