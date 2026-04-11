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

    const { imageUrl, imageUrls } = await req.json();
    
    // Support single image (legacy) or multiple images
    const urls: string[] = imageUrls || (imageUrl ? [imageUrl] : []);
    
    if (urls.length === 0) {
      return NextResponse.json({ error: "No image URL(s) provided" }, { status: 400 });
    }

    // Validate all URLs are from our Supabase storage
    for (const url of urls) {
      if (!url.includes("supabase.co/storage")) {
        return NextResponse.json({ error: "Invalid image source" }, { status: 400 });
      }
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    // Fetch all images and convert to base64 (max 6 to stay within limits)
    const imagesToAnalyze = urls.slice(0, 6);
    const imageContents = [];
    
    for (const url of imagesToAnalyze) {
      try {
        const imageResponse = await fetch(url);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString("base64");
        const mediaType = imageResponse.headers.get("content-type") || "image/jpeg";
        
        imageContents.push({
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: mediaType,
            data: base64,
          },
        });
      } catch (e) {
        console.error("Failed to fetch image:", url, e);
      }
    }

    if (imageContents.length === 0) {
      return NextResponse.json({ error: "Failed to fetch any images" }, { status: 500 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              ...imageContents,
              {
                type: "text",
                text: `You are a car identification expert. You have ${imageContents.length} photo(s) of the same car. Analyze ALL photos together — exterior shots for make/model/color/body, interior shots for transmission type (look at gear stick/shifter), dashboard for odometer reading.

Return ONLY valid JSON (no markdown, no explanation):

{
  "make": "manufacturer name — MUST be one of: Toyota, Mercedes-Benz, BMW, Audi, Volkswagen, Honda, Nissan, Hyundai, Kia, Ford, Mazda, Peugeot, Renault, Volvo, Skoda, SEAT, Fiat, Porsche, Land Rover, Jeep, Lexus, Mitsubishi, Suzuki, Citroën, Opel, Tesla, Mini, Alfa Romeo, Dacia, Cupra",
  "model": "specific model name (e.g. 3 Series, Corolla, ix20, Golf). Look for badges/emblems on the car.",
  "color": "MUST be one of: White, Black, Silver, Grey, Blue, Red, Green, Brown, Beige, Orange",
  "body_type": "MUST be one of: Sedan, Hatchback, SUV, Coupe, Convertible, Van, Pickup, Wagon",
  "transmission": "ONLY if you can see the gear stick/shifter in an interior photo: Manual or Automatic. If not visible, set to null.",
  "fuel_type": "ONLY if you see a badge like CDI, TDI, HDI, diesel, hybrid, electric, or EV charging port: Petrol, Diesel, Hybrid, Electric, or LPG. If not visible, set to null.",
  "confidence": "high, medium, or low",
  "dashboard_reading": "ONLY if dashboard/odometer is clearly visible, read the exact km or miles value. If NOT visible, set to null.",
  "notes": "badges spotted, generation/facelift clues, anything useful for the seller"
}

RULES:
- Analyze ALL photos — don't just look at the first one.
- For transmission: look at gear stick photos. Automatic = no H-pattern/numbers, has P/R/N/D or tiptronic. Manual = H-pattern with numbered gears, 3 pedals.
- DO NOT guess year or mileage from appearance. Only report mileage if you see the odometer.
- Look for model badges/emblems carefully (e.g. "ix20" not "i20", "320d" not "3 Series").
- If you can't identify something with confidence, set it to null.
- Return ONLY valid JSON.`
              }
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", response.status, err);
      return NextResponse.json({ error: "AI analysis failed", detail: `API returned ${response.status}` }, { status: 500 });
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
