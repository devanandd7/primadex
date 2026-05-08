import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json();
    const adminSecret = process.env.ADMIN_SECRET;

    if (secret === adminSecret && adminSecret) {
      const response = NextResponse.json({ success: true });
      
      // Set the cookie
      response.cookies.set("admin_token", adminSecret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
