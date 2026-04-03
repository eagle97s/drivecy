import { NextRequest, NextResponse } from "next/server";

// Rate limiter (shared concept, separate from analyze)
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 60 * 1000;

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
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const listing = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    // Build image content if available
    const content: Array<{ type: string; source?: { type: string; media_type: string; data: string }; text?: string }> = [];

    // Include first image for cross-reference if available
    if (listing.images?.[0] && listing.images[0].includes("supabase.co")) {
      try {
        const imgRes = await fetch(listing.images[0]);
        const imgBuf = await imgRes.arrayBuffer();
        const base64 = Buffer.from(imgBuf).toString("base64");
        const mediaType = imgRes.headers.get("content-type") || "image/jpeg";
        content.push({
          type: "image",
          source: { type: "base64", media_type: mediaType, data: base64 },
        });
      } catch {
        // Skip image if fetch fails
      }
    }

    content.push({
      type: "text",
      text: `You are a car listing quality checker for DriveCY, a car marketplace in Cyprus. 

The user is about to post this listing:
- Title: ${listing.title}
- Make: ${listing.make}
- Model: ${listing.model}
- Year: ${listing.year}
- Price: €${listing.price}
- Mileage: ${listing.mileage} km
- Fuel: ${listing.fuelType}
- Transmission: ${listing.transmission}
- Body Type: ${listing.bodyType}
- Color: ${listing.color || "not specified"}
- City: ${listing.city}
- Description: ${listing.description || "none"}

${listing.images?.[0] ? "I've also included their first photo. Cross-reference the photo with the listing data." : "No photo was provided."}

Analyze this listing and return JSON ONLY:
{
  "status": "good" | "needs_fixes" | "suspicious",
  "score": 1-10,
  "issues": [
    {"field": "field_name", "severity": "error" | "warning" | "tip", "message": "what's wrong and how to fix it"}
  ],
  "corrections": {
    "field_name": "corrected_value"
  },
  "summary": "A short, friendly summary of the listing quality in 1-2 sentences",
  "price_assessment": "A quick note on whether the price seems fair for Cyprus market (e.g. 'Seems reasonable for a 2020 Toyota Corolla in Cyprus' or 'Price seems high for this year/mileage')"
}

Check for:
1. Does the make/model/year match the photo (if provided)?
2. Is the mileage realistic for the year? (e.g. 5000km on a 2010 car = suspicious, 500000km on a 2023 = wrong)
3. Is mileage in km? (Cyprus uses km, but UK imports might have miles - if mileage looks like miles, flag it and provide km conversion)
4. Is the price realistic for Cyprus market?
5. Common typos or errors in make/model names
6. Missing important info (color, description)
7. If description has grammar issues, suggest a better version

Return ONLY valid JSON.`
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{ role: "user", content }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Validation API error:", response.status, err);
      return NextResponse.json({ error: "Validation failed" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content[0]?.text || "";

    try {
      const result = JSON.parse(text);
      return NextResponse.json(result);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return NextResponse.json(JSON.parse(jsonMatch[0]));
      return NextResponse.json({ error: "Could not parse response" }, { status: 500 });
    }
  } catch (error) {
    console.error("Validate listing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
