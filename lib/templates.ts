// Central store for all Primadex v3.0 templates
export const CATEGORIES = [
  { id: "desktop-app", label: "🖥️ Desktop App" },
  { id: "mobile-app", label: "📱 Mobile App" },
  { id: "saas", label: "🌐 SaaS / Web App" },
  { id: "subscription", label: "🔄 Subscription Product" },
  { id: "iot", label: "🔧 IoT / Hardware" },
  { id: "physical", label: "🍳 Physical Product" },
  { id: "medical", label: "🏥 Medical / Health Tool" },
  { id: "script", label: "🛠️ Script / Utility" },
];

const UNIVERSAL = `
## IDENTITY
- **Product Name:** 
- **Category:** 
- **Badge:** New | Popular | Featured | Beta | Sale
- **Tagline:** One punchy sentence. What it does + who it's for.
- **Short Description:** 2-3 lines. The value. Not the how.

## MEDIA
- **Images:** Min 3 (product shots, UI screenshots, in-use photos)
- **Demo Video:** YouTube link (biggest trust signal — don't skip)

## DESCRIPTION
- **Problem It Solves:** "Most [users] struggle with [X]. This fixes it."
- **Full Description:** 150-400 words. What it does. Why it's different.
- **Who Is It For:** e.g. Students / Teachers / Home cooks / Clinics
- **Key Use Cases:**
  1. 
  2. 
  3. 

## FEATURES
> Write 5-8 features. Benefit first — not technical detail.
> ✅ Good: "Works offline — no internet needed, ever"
> ❌ Bad:  "Uses local SQLite database"

- 
- 
- 
- 
- 

## COMMERCIALS
- **Access Type:** Free | Paid (one-time) | Subscription | Freemium
- **Price:** ₹___
- **Demo / Trial:** Live demo link OR "7-day free trial"
- **Refund Policy:** e.g. "7-day refund if it doesn't work as described"
- **Support:** Email | WhatsApp | Chat — response time
`;

const CATEGORY_FIELDS: Record<string, string> = {
  "desktop-app": `
## 🖥️ DESKTOP APP SPECIFICS
- **Platform:** Windows | macOS | Linux | All
- **Download:** .exe (Windows) | .dmg (macOS) | .AppImage (Linux)
- **Minimum OS:** e.g. Windows 10 or later / macOS 12 or later
- **Storage Required:** e.g. 200MB
- **Internet Required:** Yes — always | No — works offline | Optional
- **Auto Updates:** Yes / No
- **Hardware Needs:** e.g. Webcam | Drawing tablet | Printer (if any)
`,
  "mobile-app": `
## 📱 MOBILE APP SPECIFICS
- **Platform:** Android | iOS | Both
- **Download:** Google Play link | App Store link
- **Minimum Version:** e.g. Android 10+ / iOS 15+
- **Permissions Used:** e.g. Camera, Microphone, Notifications
- **Works Offline:** Yes / Partially / No
- **In-App Purchases:** Yes / No
`,
  "saas": `
## 🌐 SaaS / WEB APP SPECIFICS
- **Access:** Browser-based — no install needed
- **Works On:** Chrome | Firefox | Safari | All modern browsers
- **Mobile Friendly:** Yes / No
- **Free Trial:** X days — no credit card / Sign up free
- **Data & Privacy:** e.g. "Your data is private. Never sold."
- **Uptime:** e.g. 99.9% guaranteed
- **Support:** Email | Live chat | Help center
`,
  "subscription": `
## 🔄 SUBSCRIPTION SPECIFICS
- **What You Get:** List exactly what's included each billing period
  - 
  - 
- **Billing:** Monthly | Yearly | Both (yearly = X% off)
- **Price:** ₹___ / month  or  ₹___ / year
- **Cancel Anytime:** Yes / No
- **Free Tier Included:** Yes (X features free) / No
- **What Happens After Cancellation:** "Cancel anytime. No lock-in."
`,
  "iot": `
## 🔧 IoT / HARDWARE SPECIFICS
- **What's In The Box:** List every component included
  - 
  - 
- **Works With:** e.g. Android phone | Any WiFi router | Home Assistant
- **Setup Time:** e.g. "Ready in 15 minutes — no technical knowledge needed"
- **Power:** e.g. USB-C 5V | AA batteries | Solar
- **Connectivity:** WiFi | Bluetooth | No wireless (standalone)
- **Control:** Mobile app | Web dashboard | Physical buttons | All
- **Dimensions:** e.g. 8cm × 5cm × 3cm
- **Works Without:** Internet? Phone? List what's NOT required
- **Certifications:** CE | RoHS | BIS | None
- **What You Can Do:**
  1. 
  2. 
  3. 
`,
  "physical": `
## 🍳 PHYSICAL PRODUCT SPECIFICS
- **Material:** e.g. Food-grade stainless steel | BPA-free plastic
- **Dimensions:** L × W × H in cm
- **Weight:** e.g. 320g
- **Capacity:** e.g. 2 liters | 500ml
- **Compatible With:** e.g. All induction cooktops | Gas stove only
- **Dishwasher Safe:** Yes / No
- **Country of Origin:** India | China | etc.
- **Warranty:** e.g. 1 year manufacturing defect warranty
- **In The Box:** List every item
  - 
  - 
- **Care Instructions:** e.g. Hand wash recommended
- **Certifications:** FSSAI | BIS | ISO | None
`,
  "medical": `
## 🏥 MEDICAL / HEALTH SPECIFICS
- **Intended Use:** e.g. "For wellness tracking only — not for clinical diagnosis"
- **Who It's For:** Patients | Caregivers | Clinics | General wellness
- **Accuracy:** e.g. ±1°C | ±2 mmHg (if measurable device)
- **Certifications:** CE | FDA cleared | CDSCO | ISO 13485 | None
- **Power:** Battery type | USB rechargeable
- **Display:** e.g. Large digit LCD — readable by elderly
- **Warranty:** e.g. 2 years
- **Important Notice:** "Consult a doctor before making medical decisions."
- **In The Box:** Device + accessories listed
  - 
  - 
`,
  "script": `
## 🛠️ SCRIPT / UTILITY SPECIFICS
- **Works On:** Windows | macOS | Linux | Browser extension
- **How To Get It:** Download ZIP | Chrome Web Store | One-click install
- **What It Does:** Plain language. Not code.
- **Input → Output:** e.g. "Paste a URL → get a clean PDF"
- **No Setup Needed?:** Yes / Requires one-time install
- **License:** Personal use | Commercial use | Open source (MIT)
- **GitHub:** Link (if open source)
`,
};

const AI_PROMPT = `
---

## AI FILL PROMPT
Paste this to Gemini or Claude with your raw notes:

\`\`\`
You are a product copywriter for Primadex marketplace.
Fill the listing template below using the raw notes I give you.

Rules:
- Write for the buyer — benefits, not technical details
- Problem statement: starts with "Most [users]..."
- Features: benefit first (what user gains), never how it's built
- If info is missing, write [TO FILL]
- Detect category automatically from context
- Output clean markdown only

Raw notes:
[PASTE YOUR NOTES HERE]

Fill this structure:
- Product Name:
- Category:
- Badge:
- Tagline:
- Short Description:
- Problem It Solves:
- Full Description:
- Who Is It For:
- Use Cases:
- Features (5-8):
- Category-Specific Fields:
- Access Type + Price:
- Refund Policy:
- Support:
\`\`\`
`;

export function generateTemplate(categoryId: string): string {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  const title = cat ? cat.label : categoryId;
  const specific = CATEGORY_FIELDS[categoryId] || "";

  return `# PRIMADEX — Asset Listing Template
**Category: ${title}**
*Primadex Asset Template v3.0*

---
${UNIVERSAL}
---
${specific}${AI_PROMPT}`;
}
