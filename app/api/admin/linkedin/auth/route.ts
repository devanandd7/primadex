import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { auth } = await import("@/auth");
    const session = await auth();

    // Security: Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const clientId = process.env.LINKED_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: "LinkedIn Client ID is missing in .env.local" }, { status: 500 });
    }

    // Dynamically resolve redirect URI based on the request origin (works for localhost and prod)
    const origin = new URL(req.url).origin;
    const redirectUri = `${origin}/api/admin/linkedin/callback`;

    // Full scopes needed for modern /rest/posts API.
    // REQUIRES "Sign In with LinkedIn using OpenID Connect" AND "Share on LinkedIn" 
    // products to be enabled in LinkedIn Developer Portal → Products tab.
    // If you get "unauthorized_scope_error", add those products first.
    const scope = "openid profile email w_member_social";
    const state = "primadex_linked_state"; // Random state key

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` + 
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}&` +
      `scope=${encodeURIComponent(scope)}`;

    console.log(`[LinkedInAuth] Redirecting to LinkedIn. Generated URL:\n${authUrl}\n`);
    return NextResponse.redirect(authUrl, 307);
  } catch (error: any) {
    console.error("[LinkedInAuth] Error initiating OAuth flow:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
