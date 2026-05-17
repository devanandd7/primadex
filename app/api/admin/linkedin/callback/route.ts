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

    let personUrn = "";
    let name = "LinkedIn Profile";
    let avatar = null;

    // Always fetch real profile — we now always request openid+profile scopes
    const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { "Authorization": `Bearer ${accessToken}` }
    });

    if (!profileResponse.ok) {
      const profileError = await profileResponse.text();
      console.error("[LinkedInCallback] Profile fetch failed:", profileError);
      return NextResponse.redirect(new URL(`/admin/linkedin?error=Failed to retrieve profile. Make sure 'Sign In with LinkedIn using OpenID Connect' is enabled in your LinkedIn Developer App.`, req.url));
    }

    const profileData = await profileResponse.json();
    const realUrn = `urn:li:person:${profileData.sub}`;
    name = `${profileData.given_name || ""} ${profileData.family_name || ""}`.trim() || profileData.name || "LinkedIn User";
    avatar = profileData.picture || null;

    // Use env override if set, otherwise use the real sub from the token
    if (process.env.LINKED_PERSON_URN) {
      personUrn = process.env.LINKED_PERSON_URN;
      if (!personUrn.startsWith("urn:li:person:")) {
        personUrn = `urn:li:person:${personUrn}`;
      }
      console.log(`[LinkedInCallback] Real sub from token: ${realUrn} | Using env URN override: ${personUrn}`);
      if (realUrn !== personUrn) {
        console.warn(`[LinkedInCallback] ⚠️  WARNING: env LINKED_PERSON_URN (${personUrn}) does NOT match the token's real identity (${realUrn}). This will cause 403 errors. Using real token URN instead.`);
        personUrn = realUrn; // Always use the real token identity to avoid 403
      }
    } else {
      personUrn = realUrn;
    }

    console.log(`[LinkedInCallback] Linked successfully to: ${name} (${personUrn})`);

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

    return NextResponse.redirect(new URL("/admin/linkedin?success=true", req.url));
  } catch (error: any) {
    console.error("[LinkedInCallback] Fatal callback error:", error);
    return NextResponse.redirect(new URL(`/admin/linkedin?error=${encodeURIComponent(error.message || "Internal Server Error")}`, req.url));
  }
}
