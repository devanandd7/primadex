import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Dynamic imports to prevent build-time evaluation issues
    const { auth } = await import("@/auth");
    const clientPromise = (await import("@/lib/mongodb-client")).default;
    
    const session = await auth();
    
    // Security: Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const appId = data.appId || "teachboard";
    console.log(`[AdminConfig] 🚀 Received update request for appId: ${appId}`);
    
    let client;
    let targetDb = "primadex"; // Default DB name

    if (appId === "teachboard") {
      console.log("[AdminConfig] 📡 Switching to TeachBoard Database...");
      const { getTeachBoardClient } = await import("@/lib/mongodb-teachboard");
      client = await getTeachBoardClient();
      targetDb = "primadex"; // Assuming we still use 'primadex' db name inside that cluster
    } else {
      const clientPromise = (await import("@/lib/mongodb-client")).default;
      client = await clientPromise;
    }
    
    if (!client) {
      console.error("[AdminConfig] ❌ Database client is null");
      return NextResponse.json({ error: "Database connection unavailable" }, { status: 503 });
    }
    
    const db = client.db(targetDb);
    
    const config = {
      appId: appId,
      currentVersion: data.currentVersion,
      downloadUrl: data.downloadUrl,
      updateInfo: data.updateInfo,
      isHardUpdate: data.isHardUpdate,
      isActive: data.isActive,
      lastUpdated: new Date(),
    };

    console.log(`[AdminConfig] 📝 Saving config: v${config.currentVersion}, HardUpdate: ${config.isHardUpdate}`);

    const result = await db.collection("app_configs").updateOne(
      { appId: config.appId },
      { $set: config },
      { upsert: true }
    );

    console.log(`[AdminConfig] ✅ Success! Database modified. appId: ${config.appId}, Matched: ${result.matchedCount}, Upserted: ${result.upsertedCount}`);

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("[AdminConfig] ❌ FATAL ERROR:", error);
    return NextResponse.json({ error: "Failed to update configuration" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("appId") || "teachboard";
    
    let client;
    let targetDb = "primadex";

    if (appId === "teachboard") {
      const { getTeachBoardClient } = await import("@/lib/mongodb-teachboard");
      client = await getTeachBoardClient();
    } else {
      const clientPromise = (await import("@/lib/mongodb-client")).default;
      client = await clientPromise;
    }
    
    if (!client) {
      return NextResponse.json({ error: "Database connection unavailable" }, { status: 503 });
    }
    
    const db = client.db(targetDb);
    const config = await db.collection("app_configs").findOne({ appId });
    
    return NextResponse.json(config || {});
  } catch (error) {
    console.error("Config fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch configuration" }, { status: 500 });
  }
}
