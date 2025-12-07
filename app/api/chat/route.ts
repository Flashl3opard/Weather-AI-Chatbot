import { NextResponse } from "next/server";
import { getWeather } from "../../../lib/weather";

/* -------------------------------------------------------------
   Model Configuration
   Try these models in order until one works with your API key
------------------------------------------------------------- */
const GEMINI_MODELS = [
  "gemini-2.5-flash",           // Latest stable
  "gemini-2.0-flash-exp",       // Experimental 2.0
  "gemini-1.5-flash-latest",    // Latest 1.5 (common)
  "gemini-1.5-pro-latest",      // Pro version
  "gemini-pro",                 // Legacy fallback
];

/* -------------------------------------------------------------
   1) GEOCODING (Open-Meteo)
------------------------------------------------------------- */
async function getCoordinates(city: string) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city
  )}&count=1&format=json`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.results?.length) {
    const r = data.results[0];
    return { lat: r.latitude, lon: r.longitude, city: r.name };
  }

  throw new Error(`City not found: ${city}`);
}

/* -------------------------------------------------------------
   2) CITY EXTRACTION (Gemini)
------------------------------------------------------------- */
async function extractCityName(text: string): Promise<string> {
  const prompt = `
Extract ONLY the city name from this text.
Rules:
• Output ONLY the city name.
• If none, output "NONE".
• No extra characters.

Message: "${text}"
`;
  
  // Try each model until one works
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const result =
          data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

        if (!result || result.toLowerCase() === "none" || result.length > 40)
          return "";

        console.log(`✅ Using model: ${model}`);
        return result;
      }
    } catch (e) {
      console.log(`❌ Model ${model} failed, trying next...`);
      continue;
    }
  }

  console.error("❌ All models failed for city extraction");
  return "";
}

/* -------------------------------------------------------------
   3) GEMINI REQUEST (with retry and model fallback)
------------------------------------------------------------- */
async function askGemini(prompt: string): Promise<string> {
  async function send(model: string) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`🔥 Gemini API Error (${model}):`, errorText);
      return "";
    }

    const json = await res.json();
    return (
      json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ""
    );
  }

  // Try each model
  for (const model of GEMINI_MODELS) {
    const reply = await send(model);
    if (reply && reply.length >= 5) {
      console.log(`✅ Using model: ${model}`);
      return reply;
    }
  }

  return "";
}

/* -------------------------------------------------------------
   4) MAIN API ROUTE
------------------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const lang: "en" | "ja" = body.lang || "en";
    const message: string = body.message || "";
    const theme: string = body.theme || "friendly";

    const reqLat: number | null = body.lat ?? null;
    const reqLon: number | null = body.lon ?? null;

    /* -------------------------------
       Localization
    -------------------------------- */
    const T = {
      en: {
        needGPS: "Location is required. Please enable GPS.",
        notFound: (c: string) =>
          `Could not find "${c}". Please enter a valid city.`,
        fallbackCity: "Your Location",
        aiFallback:
          "I couldn't generate a response. Please try again with another question.",
        system: (city: string, theme: string, msg: string) => `
You are a friendly weather assistant.
Language: English only.
Theme personality: ${theme}

Location: ${city}
User question: "${msg}"

Respond in:
• 2–3 short sentences
• Friendly + practical
• Must use the weather data provided below
• Add safety warnings if necessary
`,
      },

      ja: {
        needGPS:
          "位置情報が必要です。現在地の使用を許可してください。",
        notFound: (c: string) => `「${c}」が見つかりませんでした。`,
        fallbackCity: "現在地",
        aiFallback:
          "回答を生成できませんでした。別の質問をお試しください。",
        system: (city: string, theme: string, msg: string) => `
あなたは親しみやすい天気アドバイザーです。
返答は日本語のみ。

テーマ: ${theme}
場所: ${city}
質問: 「${msg}」

以下の天気データを使って、
• 2〜3文で
• 優しく自然に説明
• 必要なら注意喚起
`,
      },
    };

    const t = T[lang] || T.en;

    /* ----------------------------------------------------
       1) Resolve coordinates
    ------------------------------------------------------- */
    let lat = reqLat ?? undefined;
    let lon = reqLon ?? undefined;
    let city = t.fallbackCity;

    const extracted = await extractCityName(message);

    if (extracted) {
      try {
        const info = await getCoordinates(extracted);
        lat = info.lat;
        lon = info.lon;
        city = info.city;
      } catch (e) {
        if (!lat || !lon) {
          return NextResponse.json({
            needsLocation: true,
            reply: t.notFound(extracted),
          });
        }
      }
    }

    if (!lat || !lon) {
      return NextResponse.json({
        needsLocation: true,
        reply: t.needGPS,
      });
    }

    /* ----------------------------------------------------
       2) Fetch Weather
    ------------------------------------------------------- */
    const weather = await getWeather(lat, lon);

    const weatherBlock = `
Weather Data:
• Temperature: ${weather.temp}°C (Feels like: ${weather.feels_like}°C)
• Min/Max: ${weather.temp_min}/${weather.temp_max}°C
• Humidity: ${weather.humidity}%
• Wind: ${weather.wind_speed} m/s (${weather.wind_deg}°)
• Condition: ${weather.mainWeather} - ${weather.condition}
• Visibility: ${weather.visibility}m
• Clouds: ${weather.clouds}%
• Sunrise: ${weather.sunrise}
• Sunset: ${weather.sunset}
`;

    /* ----------------------------------------------------
       3) AI Prompt
    ------------------------------------------------------- */
    const prompt =
      t.system(city, theme, message) + "\n\n" + weatherBlock;

    /* ----------------------------------------------------
       4) Ask Gemini
    ------------------------------------------------------- */
    let reply = await askGemini(prompt);
    if (!reply || reply.length < 3) reply = t.aiFallback;

    /* ----------------------------------------------------
       5) Response
    ------------------------------------------------------- */
    return NextResponse.json({
      reply,
      city,
      weather,
    });
  } catch (err) {
    console.error("❌ API ERROR:", err);
    return NextResponse.json(
      { reply: "Server error. Try again later." },
      { status: 500 }
    );
  }
}