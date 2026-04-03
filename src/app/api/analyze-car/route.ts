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
        model: "claude-sonnet-4-20250514",
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
  "make": "manufacturer name — MUST be one of: Toyota, Mercedes-Benz, BMW, Audi, Volkswagen, Honda, Nissan, Hyundai, Kia, Ford, Mazda, Peugeot, Renault, Volvo, Skoda, SEAT, Fiat, Porsche, Land Rover, Jeep, Lexus, Mitsubishi, Suzuki, Citroën, Opel, Tesla, Mini, Alfa Romeo, Dacia, Cupra",
  "model": "specific model name (e.g. 3 Series, Corolla, C-Class, Golf, Civic). Look for badges/emblems on the car.",
  "color": "MUST be one of: White, Black, Silver, Grey, Blue, Red, Green, Brown, Beige, Orange",
  "body_type": "MUST be one of: Sedan, Hatchback, SUV, Coupe, Convertible, Van, Pickup, Wagon",
  "confidence": "high, medium, or low",
  "dashboard_reading": "ONLY if dashboard/odometer is clearly visible in the photo, read the exact value and unit (km or miles). If NOT visible, set to null. NEVER guess mileage.",
  "notes": "any additional observations (badges spotted, generation/facelift details, visible damage)"
}

CRITICAL RULES:
- ONLY fill what you can ACTUALLY SEE in the photo. Do NOT guess year, mileage, fuel type, or transmission.
- DO NOT estimate mileage from year. ONLY report mileage if you see a dashboard/odometer in the photo.
- DO NOT guess the year. Only suggest a year if you can clearly identify the generation/facelift from design elements.
- Look for badges, emblems, and model numbers on the car (e.g. "C220", "320d", "1.6 TDI").
- If you see "CDI", "TDI", "d", "diesel" badge → note it in notes but don't set fuel_type.
- If you can't identify something, set it to null — NEVER guess.
- Return ONLY valid JSON, no markdown, no explanation.`
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
