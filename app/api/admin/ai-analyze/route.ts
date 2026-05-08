import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

async function generate(contents: any): Promise<string> {
  try {
    const response = await ai.models.generateContent({ model: MODEL, contents });
    return response.text as string;
  } catch (err: any) {
    const status = err?.status;
    if (status === 429) throw new Error("RATE_LIMITED");
    if (status === 503) throw new Error("OVERLOADED");
    throw err;
  }
}

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is missing. Add GEMINI_API_KEY to .env.local" }, { status: 500 });
    }

    const formData = await req.formData();
    const mode = formData.get("mode") as string;
    const userInput = formData.get("input") as string;
    const directText = formData.get("text") as string;
    const file = formData.get("file") as File;

    if (mode === "generate") {
      const prompt = `
        You are a professional marketplace copywriter for Primadex.
        Based on this input: "${userInput}", write a complete product listing in clean Markdown.
        
        Structure:
        # [Product Name]
        ## Tagline
        ## Short Description (2-3 lines, value-focused)
        ## Problem It Solves
        ## Full Description (150-300 words)
        ## Who Is It For
        ## Key Features (5-8 bullet points, benefit-first)
        ## Access Type & Price (INR)
        
        Write for buyers — benefits over technical details. Sound premium and professional.
      `;
      const text = await generate(prompt);
      return NextResponse.json({ content: text });
    }

    if (mode === "generate_blog") {
      const imageUrls = formData.getAll("images") as string[];
      
      const prompt = `
        You are an enthusiastic product marketer for Primadex.
        Based on this input: "${userInput}", write a compelling blog post (in Markdown).
        Focus ONLY on:
        - The Pros and best parts of the product.
        - The key features and how they benefit the user.
        - Real-world examples or use cases.
        Do NOT include pricing, technical specs, or a dry list. Make it engaging and easy to read.

        I have also provided some images of the product. 
        Please use the context from the images to enrich your description. 
        CRITICAL INSTRUCTION: You MUST actively embed the images into the Markdown blog post at appropriate places to make the blog look visually appealing.
        Use standard markdown syntax: ![alt text](image_url).
      `;

      const contentsParts: any[] = [{ text: prompt }];

      for (const url of imageUrls) {
        if (!url) continue;
        try {
          const res = await fetch(url);
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const mimeType = res.headers.get("content-type") || "image/jpeg";
          
          contentsParts.push({ text: `Image URL to embed: ${url}` });
          contentsParts.push({
            inlineData: {
              data: buffer.toString("base64"),
              mimeType
            }
          });
        } catch (err) {
          console.error("Failed to fetch image for AI", err);
        }
      }

      const text = await generate(contentsParts);
      return NextResponse.json({ content: text });
    }

    // Analyze mode
    let textContent = "";
    if (mode === "analyze_text") {
      textContent = directText;
    } else {
      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
      textContent = await file.text();
    }

    const prompt = `
      Analyze this product document and extract structured data for a marketplace listing.
      Return ONLY a valid JSON object — no markdown, no explanation.

      Document:
      ${textContent}

      JSON structure:
      {
        "name": "string",
        "description": "string (max 300 chars, buyer-focused)",
        "longDescription": "string",
        "category": "saas | desktop-app | mobile-app | iot | medical | physical | script | subscription",
        "type": "free | paid | subscription",
        "price": 0,
        "badge": "New | Featured | Sale | Beta | Popular",
        "features": ["benefit-first feature 1", "..."],
        "techStack": ["Tech 1", "(Note: output empty array [] if category is saas, desktop-app, or mobile-app)"],
        "security": "string (SaaS only)",
        "support": "string (SaaS only)",
        "onboarding": "string (SaaS only)",
        "integrations": ["tool1"],
        "fileFormats": [".ext"],
        "compatibility": "string (assets/scripts)",
        "techSpecs": "string (assets)",
        "license": "string (assets)",
        "refundPolicy": "string",
        "trialInfo": "string"
      }
    `;

    const aiText = await generate(prompt);
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "AI returned unreadable output. Try again." }, { status: 500 });

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("AI Error:", error.message);
    if (error.message === "RATE_LIMITED") {
      return NextResponse.json({ error: "Rate limit reached. Please wait ~30 seconds and try again." }, { status: 429 });
    }
    if (error.message === "OVERLOADED") {
      return NextResponse.json({ error: "AI is temporarily overloaded. Please try again in a moment." }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
