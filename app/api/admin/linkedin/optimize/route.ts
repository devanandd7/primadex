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

    const { auth } = await import("@/auth");
    const session = await auth();
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

    if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, style, language } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Please enter some text to optimize." }, { status: 400 });
    }

    let languagePrompt = "";
    if (language === "hinglish") {
      languagePrompt = `
        LANGUAGE REQUIREMENT:
        - Write the output in conversational, viral, and natural **Hinglish** (Hindi words written in the Roman/English alphabet, mixed with professional English tech terminology).
        - Keep the sentence structure organic and friendly. Example: "Aaj maine ship kiya...", "Kaise aap log...", "Yeh feature bahut useful hai...".
        - CRITICAL: DO NOT use pure Devanagari script (हिंदी text is strictly banned). Keep it written entirely in the English/Roman keyboard alphabet.
        - Ensure it reads like a real human software builder sharing progress naturally, not like a dry translation engine output.
      `;
    } else {
      languagePrompt = `
        LANGUAGE REQUIREMENT:
        - Write the output in clean, crisp, premium, high-performance professional **English**.
      `;
    }

    let stylePrompt = "";
    
    switch (style) {
      case "builder":
        stylePrompt = `
          STYLE: Indie Builder / Build in Public
          TONE: Transparent, authentic, conversational, humble yet exciting, engineering-focused.
          HOOK STYLE: Highlight a specific challenge solved, something shipped today, or a major technical/design breakthrough.
          STRUCTURE:
          - A high-impact hook about what you built, shipped, or solved (1-2 lines).
          - Short paragraph describing the "before" or the struggle.
          - Clear, bulleted list of features/fixes shipped today.
          - Key lesson or next steps.
          - A natural conversational question asking other builders/creators for their thoughts or feedback.
          SPACING: Keep paragraphs to a maximum of 2 sentences. Use liberal whitespace.
        `;
        break;
      case "launch":
        stylePrompt = `
          STYLE: Product Launch / Feature Pitch
          TONE: High-energy, value-driven, authoritative, professional, persuasive.
          HOOK STYLE: Scroll-stopping benefit hook (under 210 characters) that addresses a key user pain point.
          STRUCTURE:
          - Bold scroll-stopping hook stating the major problem solved or immediate benefit.
          - High-value introduction of the product/feature.
          - Benefit-first bullet points (3-5 points) using bold keywords, e.g., "• **Save 5 hours**: [explanation]".
          - Explicit value offer or pricing.
          - Action-oriented Call to Action (CTA) telling readers exactly how to get it or where to sign up.
          SPACING: Clean, highly skimmability, 1-2 sentences per paragraph.
        `;
        break;
      case "thought":
        stylePrompt = `
          STYLE: Professional Thought Leadership / Insights
          TONE: Educational, insightful, strategic, calm, analytical, authoritative.
          HOOK STYLE: Challenge standard industry wisdom, share a contrarian take, or present a hard-earned career/business lesson.
          STRUCTURE:
          - Powerful philosophical, statistical, or contrarian hook.
          - Narrative/context establishing why this insight is critical right now.
          - 3-4 structured, bulleted/numbered lessons or actionable takeaways.
          - A visionary conclusion or strategic summary.
          - An engaging dialogue-sparking question to invite professional debate in the comments.
          SPACING: Sophisticated layout with balanced whitespace. Maximum 2 sentences per paragraph.
        `;
        break;
      case "viral":
        stylePrompt = `
          STYLE: Viral Storytelling
          TONE: Highly engaging, emotional, empathetic, personal, inspirational, motivational.
          HOOK STYLE: High-tension or emotional mid-story hook that creates a loop of curiosity.
          STRUCTURE:
          - 1-line punchy hook starting in the middle of a conflict or dramatic realization.
          - Story arc: The struggle/pain point -> The turning point/realization -> The resolution/outcome.
          - Deep emotional takeaway or motivating message.
          - A warm, simple CTA inviting readers to share their own experiences or stories.
          SPACING: Dynamic and punchy. Maximum 1 sentence per paragraph (high whitespace usage) to build a rhythmic visual flow.
        `;
        break;
      default:
        return NextResponse.json({ error: "Invalid style selected." }, { status: 400 });
    }

    const systemPrompt = `
      You are an expert LinkedIn Content Manager and World-Class Social Media Copywriter.
      Your task is to take the user's raw draft/ideas and rewrite them into a high-performance LinkedIn post.
      
      Here is the raw draft:
      """
      ${text}
      """

      Apply this configuration:
      ${stylePrompt}
      ${languagePrompt}

      CRITICAL RULES:
      1. LENGTH & ENGAGEMENT SWEET SPOT: The input draft from the admin can be of any size (unlimited input). Regardless of how long or short the draft is, refine, expand or distill it into a high-performance LinkedIn post targeting the sweet spot of 1,300 to 2,000 characters. DO NOT write a short one-line or two-line post, but also DO NOT exceed the LinkedIn limit of 3,000 characters. It should contain enough value and story depth so readers stay highly engaged without getting bored.
      2. THE "SEE-MORE" HOOK: Design the first 200 to 210 characters (the first 2 hook sentences) to be extremely powerful, curiosity-provoking, or challenge-focused. LinkedIn cuts off content here with a "See More" button, so this initial section must make it impossible for the user not to click it.
      3. NO CORPORATE AI BUZZWORDS: Do not use generic AI jargon. Strictly BAN these words: "delve", "transformative", "synergy", "unleash", "demystify", "embark", "revolutionary", "tapestry", "moreover", "furthermore".
      4. VISUAL FORMATTING & SCANNING: Keep the content exceptionally readable. Use double line breaks (Enter twice) to create distinct visual gaps between paragraphs. Use short, crisp paragraphs (1-2 sentences maximum per paragraph) to make the text beautifully skimmable on mobile screens.
      5. EMOJIS: Use emojis very tastefully (maximum 1 emoji per paragraph, and NEVER in the first 2 hook sentences).
      6. HASHTAGS: Place exactly 3 highly relevant hashtags at the very end of the post, separated by ample whitespace. Do NOT mix hashtags in the middle of sentences.
      7. OUTPUT FORMAT: Output ONLY the finalized optimized post text. Do not include markdown code blocks (\`\`\`), do not include introductory text like "Here is your post:", and do not write anything else. Just the plain text of the post.
    `;

    const optimizedPost = await generate(systemPrompt);

    return NextResponse.json({ optimizedText: optimizedPost.trim() });

  } catch (error: any) {
    console.error("LinkedIn AI Optimizer Error:", error.message);
    if (error.message === "RATE_LIMITED") {
      return NextResponse.json({ error: "Rate limit reached. Please wait ~30 seconds and try again." }, { status: 429 });
    }
    if (error.message === "OVERLOADED") {
      return NextResponse.json({ error: "AI is temporarily overloaded. Please try again in a moment." }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
