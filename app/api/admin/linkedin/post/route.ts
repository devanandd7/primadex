import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { auth } = await import("@/auth");
    const session = await auth();
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

    // 1. Auth check
    if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch LinkedIn credentials from MongoDB
    const clientPromise = (await import("@/lib/mongodb-client")).default;
    const db = (await clientPromise).db("primadex");
    const credential = await db.collection("linkedin_credentials").findOne({ adminEmail: session.user.email });

    if (!credential || !credential.accessToken || !credential.personUrn) {
      return NextResponse.json({ error: "LinkedIn account not connected. Please connect your account first." }, { status: 400 });
    }

    // Check if token is expired
    if (new Date() > new Date(credential.expiresAt)) {
      return NextResponse.json({ error: "LinkedIn login session expired. Please reconnect your account." }, { status: 401 });
    }

    const { accessToken, personUrn } = credential;

    // 3. Parse FormData
    const formData = await req.formData();
    const text = formData.get("text") as string;
    const mediaFile = formData.get("media") as File | null;

    if (!text && (!mediaFile || mediaFile.size === 0)) {
      return NextResponse.json({ error: "Post content cannot be empty. Add text or media." }, { status: 400 });
    }

    let assetUrn = "";
    let mediaCategory = "NONE";

    // 4. Handle Media Upload if present
    if (mediaFile && mediaFile.size > 0) {
      const mimeType = mediaFile.type;
      const size = mediaFile.size;
      const buffer = Buffer.from(await mediaFile.arrayBuffer());

      const isImage = mimeType.startsWith("image/");
      const isVideo = mimeType.startsWith("video/");

      if (!isImage && !isVideo) {
        return NextResponse.json({ error: "Unsupported file type. Only images and videos are supported." }, { status: 400 });
      }

      // Check file size limits
      if (isImage && size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Image size exceeds 10MB limit." }, { status: 400 });
      }
      if (isVideo && size > 200 * 1024 * 1024) {
        return NextResponse.json({ error: "Video size exceeds 200MB limit." }, { status: 400 });
      }

      const recipe = isImage 
        ? "urn:li:digitalmediaRecipe:feedshare-image" 
        : "urn:li:digitalmediaRecipe:feedshare-video";

      mediaCategory = isImage ? "IMAGE" : "VIDEO";

      console.log(`[LinkedInPost] Registering media: ${mediaFile.name} (${mimeType}) with recipe: ${recipe}`);

      // Step A: Register the asset with LinkedIn
      const registerRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: [recipe],
            owner: personUrn,
            serviceRelationships: [
              {
                relationshipType: "OWNER",
                identifier: "urn:li:userGeneratedContent"
              }
            ]
          }
        })
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        console.error("[LinkedInPost] Media registration failed:", registerData);
        return NextResponse.json({ error: `Media registration failed: ${registerData.message || "Unknown error"}` }, { status: 502 });
      }

      const uploadUrl = registerData.value?.uploadMechanism?.["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]?.uploadUrl;
      assetUrn = registerData.value?.asset;

      if (!uploadUrl || !assetUrn) {
        console.error("[LinkedInPost] Incomplete asset registration response:", registerData);
        return NextResponse.json({ error: "Failed to obtain upload URL from LinkedIn." }, { status: 502 });
      }

      console.log(`[LinkedInPost] Uploading binary data to pre-signed URL...`);

      // Step B: Upload the binary buffer to the pre-signed URL
      // Note: Omit Bearer token header as S3 URL is pre-signed and will reject auth headers
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": mimeType
        },
        body: buffer
      });

      if (!uploadRes.ok) {
        const uploadErr = await uploadRes.text();
        console.error("[LinkedInPost] Binary file upload failed:", uploadErr);
        return NextResponse.json({ error: "Failed to upload file binary data to LinkedIn servers." }, { status: 502 });
      }

      console.log(`[LinkedInPost] Binary upload complete. Asset URN: ${assetUrn}`);
    }

    // 5. Construct UGC Post Request
    const ugcPostBody: any = {
      author: personUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: text || ""
          },
          shareMediaCategory: mediaCategory
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    };

    if (assetUrn) {
      ugcPostBody.specificContent["com.linkedin.ugc.ShareContent"].media = [
        {
          status: "READY",
          media: assetUrn,
          title: {
            text: mediaFile?.name || "Uploaded Media"
          }
        }
      ];
    }

    console.log(`[LinkedInPost] Submitting UGC Post to LinkedIn...`);

    const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(ugcPostBody)
    });

    // 6. Handle response
    let postUrn = postRes.headers.get("x-restli-id");
    
    if (!postRes.ok) {
      const postErr = await postRes.json();
      console.error("[LinkedInPost] Post creation failed:", postErr);
      return NextResponse.json({ error: `LinkedIn post creation failed: ${postErr.message || "Unknown error"}` }, { status: 502 });
    }

    if (!postUrn) {
      try {
        const postData = await postRes.json();
        postUrn = postData.id || postData.urn || "";
      } catch (e) {
        // Fallback or ignore
      }
    }

    if (!postUrn) {
      console.warn("[LinkedInPost] Post succeeded but returned no URN.");
      postUrn = "unknown";
    }

    const publicUrl = postUrn !== "unknown" 
      ? `https://www.linkedin.com/feed/update/${postUrn}` 
      : "https://www.linkedin.com";

    console.log(`[LinkedInPost] Success! Post created: ${postUrn}`);
    return NextResponse.json({
      success: true,
      postId: postUrn,
      url: publicUrl
    });

  } catch (error: any) {
    console.error("[LinkedInPost] Fatal posting error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
