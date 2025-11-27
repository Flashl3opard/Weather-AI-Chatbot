import { NextResponse } from "next/server";
import { getWeather } from "../../../lib/weather";

async function getCoordinates(city: string) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city
  )}&count=1&format=json`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.results?.length) {
    const r = data.results[0];
    return {
      lat: r.latitude,
      lon: r.longitude,
      city: r.name,
    };
  }

  throw new Error(`City not found: ${city}`);
}

async function extractCityName(message: string): Promise<string> {
  const prompt = `
You are an expert at extracting city names.
Rules:
1. Return ONLY the detected city name.
2. If no city → return "NONE".
3. Do NOT return any other text.

Message: "${message}"

Answer:
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    const result =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (result.toLowerCase() === "none" || result.length > 50) return "";
    return result;
  } catch (e) {
    console.error("City extraction failed:", e);
    return "";
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json();

    const lang: "en" | "ja" = body.lang;
    const message: string = body.message;
    const theme: string = body.theme;

    const reqLat: number | undefined = body.lat;
    const reqLon: number | undefined = body.lon;

    const L = {
      en: {
        needLocation: "Location is required. Please enable GPS.",
        notFound: (c: string) =>
          `Could not find “${c}”. Please allow location access.`,
        fallbackCity: "Your Location",
        aiError: "AI returned no response.",
        sysRole: (city: string, theme: string) => `
You are a friendly weather assistant.
Language: English only.
Theme personality: ${theme}

Location: ${city}
User question: "${message}"

Respond in:
• 2–3 short sentences
• Friendly + practical
• Based on ALL weather data below
• Include safety warnings if needed
`,
      },
      ja: {
        needLocation: "位置情報が必要です。現在地の使用を許可してください。",
        notFound: (c: string) => `「${c}」が見つかりませんでした。`,
        fallbackCity: "現在地",
        aiError: "（AIからの応答がありません）",
        sysRole: (city: string, theme: string) => `
あなたは親しみやすい天気アドバイザーです。
返答は必ず日本語で。

テーマ: ${theme}
場所: ${city}
質問: 「${message}」

以下の天気データを参考に、
• 2〜3文で
• 優しく自然に
• 必要なら注意喚起
`,
      },
    };

    const t = L[lang];


    let lat: number | undefined = reqLat;
    let lon: number | undefined = reqLon;
    let city: string = t.fallbackCity;

    const extractedCity = await extractCityName(message);

    if (extractedCity) {
      try {
        const info = await getCoordinates(extractedCity);
        lat = info.lat;
        lon = info.lon;
        city = info.city;
      } catch {
        if (!lat || !lon) {
          return NextResponse.json({
            needsLocation: true,
            message: t.notFound(extractedCity),
          });
        }
      }
    }

    if (!lat || !lon) {
      return NextResponse.json({
        needsLocation: true,
        message: t.needLocation,
      });
    }

    const weather = await getWeather(lat, lon);

    const weatherBlock = `
Weather Info:
Temp: ${weather.temp}°C
Feels Like: ${weather.feels_like}°C
Min/Max: ${weather.temp_min}/${weather.temp_max}°C
Humidity: ${weather.humidity}%
Wind: ${weather.wind_speed} m/s (${weather.wind_deg}°)
Condition: ${weather.mainWeather} (${weather.condition})
Visibility: ${weather.visibility}m
Clouds: ${weather.clouds}%
Sunrise: ${weather.sunrise}
Sunset: ${weather.sunset}
`;

    const finalPrompt = t.sysRole(city, theme) + weatherBlock;

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: finalPrompt }] }],
        }),
      }
    );

    const aiData = await aiRes.json();
    const reply =
      aiData.candidates?.[0]?.content?.parts?.[0]?.text ?? t.aiError;

    return NextResponse.json({ reply, weather, city });
  } catch (err: any) {
    console.error("API ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server Error" },
      { status: 500 }
    );
  }
}
