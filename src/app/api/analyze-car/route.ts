import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // max requests per window
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    // Validate URL is from our Supabase storage
    if (!imageUrl.includes("supabase.co/storage")) {
      return NextResponse.json({ error: "Invalid image source" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    // Fetch image and convert to base64
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString("base64");
    const mediaType = imageResponse.headers.get("content-type") || "image/jpeg";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64,
                },
              },
              {
                type: "text",
                text: `You are a car identification expert. Analyze this car photo and provide the following information in JSON format ONLY (no other text):

{
  "make": "manufacturer name (e.g. Toyota, BMW, Mercedes-Benz)",
  "model": "model name (e.g. Corolla, 3 Series, C-Class)",
  "year_estimate": "estimated year or year range (e.g. 2020 or 2018-2021)",
  "color": "main body color (e.g. White, Black, Silver, Blue, Red)",
  "body_type": "one of: Sedan, Hatchback, SUV, Coupe, Convertible, Van, Pickup, Wagon",
  "confidence": "high, medium, or low",
  "dashboard_reading": "if dashboard/odometer is visible, read the km/miles value and specify unit (km or miles). If showing miles, also provide the km conversion. If not visible, set to null",
  "notes": "any additional observations (damage, modifications, interior details, if odometer appears tampered)"
}

Important rules:
- If you see a dashboard/speedometer: check if it shows km/h or mph. Most cars in Cyprus use km/h.
- If you see an odometer reading, report the exact number and whether it's in km or miles.
- If odometer shows miles (common in UK-imported cars in Cyprus), convert to km (multiply by 1.609).
- If you can't identify something with confidence, say "unknown" rather than guessing.
- Return ONLY valid JSON, no markdown, no explanation.`
              }
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content[0]?.text || "";
    
    // Parse the JSON from the response
    try {
      const carInfo = JSON.parse(text);
      return NextResponse.json(carInfo);
    } catch {
      // Try to extract JSON from the response if it has extra text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const carInfo = JSON.parse(jsonMatch[0]);
        return NextResponse.json(carInfo);
      }
      return NextResponse.json({ error: "Could not parse AI response", raw: text }, { status: 500 });
    }
  } catch (error) {
    console.error("Analyze car error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
