import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      console.error(`[LinkedInCallback] OAuth Error: ${error} - ${errorDescription}`);
      return NextResponse.redirect(new URL("/admin/linkedin?error=" + encodeURIComponent(errorDescription || error), req.url));
    }

    if (!code) {
      return new Response("Missing code parameter", { status: 400 });
    }

    const { auth } = await import("@/auth");
    const session = await auth();
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

    if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const clientId = process.env.LINKED_CLIENT_ID;
    const clientSecret = process.env.LINKED_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Client Credentials missing" }, { status: 500 });
    }

    const origin = new URL(req.url).origin;
    const redirectUri = `${origin}/api/admin/linkedin/callback`;

    // 1. Exchange OAuth code for Access Token
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      console.error("[LinkedInCallback] Token Exchange Failed:", tokenData);
      return NextResponse.redirect(new URL(`/admin/linkedin?error=${encodeURIComponent(tokenData.error_description || "Token exchange failed")}`, req.url));
    }

    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in;

    // 2. Query user info to fetch sub/name/avatar using the openid profile scope endpoint
    const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });

    if (!profileResponse.ok) {
      const profileError = await profileResponse.text();
      console.error("[LinkedInCallback] Profile fetch failed:", profileError);
      return NextResponse.redirect(new URL(`/admin/linkedin?error=Failed to retrieve profile`, req.url));
    }

    const profileData = await profileResponse.json();
    const personUrn = `urn:li:person:${profileData.sub}`;
    const name = `${profileData.given_name || ""} ${profileData.family_name || ""}`.trim() || profileData.name || "LinkedIn User";
    const avatar = profileData.picture || null;

    // 3. Save to database using clientPromise
    const clientPromise = (await import("@/lib/mongodb-client")).default;
    const db = (await clientPromise).db("primadex");

    const credentialData = {
      appId: "primadex",
      adminEmail: session.user.email,
      accessToken,
      personUrn,
      name,
      avatar,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      updatedAt: new Date()
    };

    await db.collection("linkedin_credentials").updateOne(
      { adminEmail: session.user.email },
      { $set: credentialData },
      { upsert: true }
    );

    console.log(`[LinkedInCallback] Linked successfully to: ${name} (${personUrn})`);
    return NextResponse.redirect(new URL("/admin/linkedin?success=true", req.url));
  } catch (error: any) {
    console.error("[LinkedInCallback] Fatal callback error:", error);
    return NextResponse.redirect(new URL(`/admin/linkedin?error=${encodeURIComponent(error.message || "Internal Server Error")}`, req.url));
  }
}
