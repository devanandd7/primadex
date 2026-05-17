import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { auth } = await import("@/auth");
    const session = await auth();
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

    if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientPromise = (await import("@/lib/mongodb-client")).default;
    const db = (await clientPromise).db("primadex");

    const credential = await db.collection("linkedin_credentials").findOne({ adminEmail: session.user.email });

    if (!credential) {
      return NextResponse.json({ connected: false });
    }

    // Check if token is expired
    const isExpired = new Date() > new Date(credential.expiresAt);
    if (isExpired) {
      return NextResponse.json({ connected: false, expired: true });
    }

    return NextResponse.json({
      connected: true,
      name: credential.name,
      avatar: credential.avatar,
      personUrn: credential.personUrn,
      expiresAt: credential.expiresAt,
      updatedAt: credential.updatedAt
    });
  } catch (error: any) {
    console.error("[LinkedInStatus] Error checking status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
