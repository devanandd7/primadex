import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { auth } = await import("@/auth");
    const session = await auth();
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

    if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientPromise = (await import("@/lib/mongodb-client")).default;
    const db = (await clientPromise).db("primadex");

    const result = await db.collection("linkedin_credentials").deleteOne({ adminEmail: session.user.email });

    if (result.deletedCount > 0) {
      console.log(`[LinkedInDisconnect] Connected account deleted for admin: ${session.user.email}`);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "No connection found to disconnect" }, { status: 400 });
  } catch (error: any) {
    console.error("[LinkedInDisconnect] Error disconnecting:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
