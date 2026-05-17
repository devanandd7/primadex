import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

function convertMarkdownBoldToUnicode(str: string): string {
  if (!str) return "";
  return str.replace(/\*\*(.*?)\*\*/g, (_, innerText) => {
    return innerText
      .split("")
      .map((char: string) => {
        const code = char.charCodeAt(0);
        // Uppercase A-Z (ASCII 65-90) -> Math Sans-Serif Bold (starts at 0x1D5D4)
        if (code >= 65 && code <= 90) {
          return String.fromCodePoint(code + 0x1D5D4 - 65);
        }
        // Lowercase a-z (ASCII 97-122) -> Math Sans-Serif Bold (starts at 0x1D5EE)
        if (code >= 97 && code <= 122) {
          return String.fromCodePoint(code + 0x1D5EE - 97);
        }
        // Digits 0-9 (ASCII 48-57) -> Math Sans-Serif Bold (starts at 0x1D7EC)
        if (code >= 48 && code <= 57) {
          return String.fromCodePoint(code + 0x1D7EC - 48);
        }
        return char;
      })
      .join("");
  });
}

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
    const rawText = formData.get("text") as string;
    const text = convertMarkdownBoldToUnicode(rawText || "");
    const mediaFile = formData.get("media") as File | null;

    if (!text && (!mediaFile || mediaFile.size === 0)) {
      return NextResponse.json({ error: "Post content cannot be empty. Add text or media." }, { status: 400 });
    }

    let mediaUrn = ""; // will hold urn:li:image:... or urn:li:video:...

    // 4. Handle Media Upload
    if (mediaFile && mediaFile.size > 0) {
      const mimeType = mediaFile.type;
      const size = mediaFile.size;
      const buffer = Buffer.from(await mediaFile.arrayBuffer());

      const isImage = mimeType.startsWith("image/");
      const isVideo = mimeType.startsWith("video/");

      if (!isImage && !isVideo) {
        return NextResponse.json({ error: "Unsupported file type. Only images and videos are supported." }, { status: 400 });
      }

      if (isImage && size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Image size exceeds 10MB limit." }, { status: 400 });
      }
      if (isVideo && size > 200 * 1024 * 1024) {
        return NextResponse.json({ error: "Video size exceeds 200MB limit." }, { status: 400 });
      }

      const liHeaders = {
        "Authorization": `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "Linkedin-Version": "202604",
        "Content-Type": "application/json"
      };

      if (isImage) {
        // ── Images API ────────────────────────────────────────────────
        console.log(`[LinkedInPost] Initializing image upload: ${mediaFile.name}`);

        const initRes = await fetch("https://api.linkedin.com/rest/images?action=initializeUpload", {
          method: "POST",
          headers: liHeaders,
          body: JSON.stringify({ initializeUploadRequest: { owner: personUrn } })
        });

        const initData = await initRes.json();
        if (!initRes.ok) {
          console.error("[LinkedInPost] Image init failed:", initData);
          return NextResponse.json({ error: `Image init failed: ${initData.message || "Unknown error"}` }, { status: 502 });
        }

        const uploadUrl: string = initData.value?.uploadUrl;
        mediaUrn = initData.value?.image;

        if (!uploadUrl || !mediaUrn) {
          console.error("[LinkedInPost] Missing uploadUrl or image URN:", initData);
          return NextResponse.json({ error: "Failed to get upload URL from LinkedIn." }, { status: 502 });
        }

        console.log(`[LinkedInPost] Uploading image binary... URN: ${mediaUrn}`);

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": mimeType },
          body: buffer
        });

        if (!uploadRes.ok) {
          console.error("[LinkedInPost] Image upload failed:", await uploadRes.text());
          return NextResponse.json({ error: "Failed to upload image to LinkedIn." }, { status: 502 });
        }

        console.log(`[LinkedInPost] Image upload complete. URN: ${mediaUrn}`);

      } else {
        // ── Videos API (3-step: initialize → chunked upload → finalize) ─
        console.log(`[LinkedInPost] Initializing video upload: ${mediaFile.name} (${(size / 1024 / 1024).toFixed(1)} MB)`);

        // Step A: Initialize upload
        const initRes = await fetch("https://api.linkedin.com/rest/videos?action=initializeUpload", {
          method: "POST",
          headers: liHeaders,
          body: JSON.stringify({
            initializeUploadRequest: {
              owner: personUrn,
              fileSizeBytes: size,
              uploadCaptions: false,
              uploadThumbnail: false
            }
          })
        });

        const initData = await initRes.json();
        if (!initRes.ok) {
          console.error("[LinkedInPost] Video init failed:", initData);
          return NextResponse.json({ error: `Video init failed: ${initData.message || "Unknown error"}` }, { status: 502 });
        }

        const uploadToken: string = initData.value?.uploadToken ?? "";
        const uploadInstructions: Array<{ uploadUrl: string; firstByte: number; lastByte: number }> =
          initData.value?.uploadInstructions || [];
        mediaUrn = initData.value?.video;

        // uploadToken can be empty string — that's fine, LinkedIn accepts it in finalizeUpload
        if (!uploadInstructions.length || !mediaUrn) {
          console.error("[LinkedInPost] Incomplete video init response:", initData);
          return NextResponse.json({ error: "Failed to get video upload instructions from LinkedIn." }, { status: 502 });
        }

        console.log(`[LinkedInPost] Video URN: ${mediaUrn}. Uploading ${uploadInstructions.length} chunk(s)...`);

        // Step B: Upload each chunk, collect ETags
        const uploadedPartIds: string[] = [];

        for (let i = 0; i < uploadInstructions.length; i++) {
          const { uploadUrl, firstByte, lastByte } = uploadInstructions[i];
          const chunk = buffer.subarray(firstByte, lastByte + 1);

          console.log(`[LinkedInPost] Uploading chunk ${i + 1}/${uploadInstructions.length} (bytes ${firstByte}-${lastByte})`);

          const chunkRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "application/octet-stream"
            },
            body: chunk
          });

          if (!chunkRes.ok) {
            console.error(`[LinkedInPost] Chunk ${i + 1} upload failed:`, await chunkRes.text());
            return NextResponse.json({ error: `Video chunk ${i + 1} upload failed.` }, { status: 502 });
          }

          // LinkedIn returns ETag per chunk — required for finalize
          const etag = chunkRes.headers.get("etag") || chunkRes.headers.get("ETag") || "";
          uploadedPartIds.push(etag);
          console.log(`[LinkedInPost] Chunk ${i + 1} uploaded. ETag: ${etag}`);
        }

        // Step C: Finalize upload
        console.log(`[LinkedInPost] Finalizing video upload...`);

        const finalizeRes = await fetch("https://api.linkedin.com/rest/videos?action=finalizeUpload", {
          method: "POST",
          headers: liHeaders,
          body: JSON.stringify({
            finalizeUploadRequest: {
              video: mediaUrn,
              uploadToken,
              uploadedPartIds
            }
          })
        });

        if (!finalizeRes.ok) {
          const finalErr = await finalizeRes.text();
          console.error("[LinkedInPost] Video finalize failed:", finalErr);
          return NextResponse.json({ error: "Failed to finalize video upload." }, { status: 502 });
        }

        console.log(`[LinkedInPost] Video upload finalized. URN: ${mediaUrn}`);
      }
    }

    // 5. Construct Post Request (modern /rest/posts API)
    const postBody: any = {
      author: personUrn,
      commentary: text || "",
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED"
      },
      lifecycleState: "PUBLISHED"
    };

    if (mediaUrn) {
      postBody.content = {
        media: {
          id: mediaUrn  // urn:li:image:... or urn:li:video:...
        }
      };
    }

    console.log(`[LinkedInPost] DEBUG - personUrn: ${personUrn}`);
    console.log(`[LinkedInPost] DEBUG - postBody:`, JSON.stringify(postBody, null, 2));
    console.log(`[LinkedInPost] Submitting post to LinkedIn via modern REST API...`);

    const postRes = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "Linkedin-Version": "202604",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(postBody)
    });

    // 6. Handle response
    let postUrn = postRes.headers.get("x-restli-id");
    
    if (!postRes.ok) {
      const rawErr = await postRes.text();
      let postErr: any = {};
      try { postErr = JSON.parse(rawErr); } catch { postErr = { raw: rawErr }; }
      console.error("[LinkedInPost] Post creation failed (status:", postRes.status, "):", JSON.stringify(postErr, null, 2));
      console.error("[LinkedInPost] Response headers:", Object.fromEntries(postRes.headers.entries()));
      return NextResponse.json({ error: `LinkedIn post creation failed: ${postErr.message || postErr.raw || "Unknown error"}` }, { status: 502 });
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
