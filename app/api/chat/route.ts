import { NextResponse } from "next/server";

// Define an interface for the expected JSON body
interface RequestBody {
  message?: string;
  location?: string;
  topic?: string;
  lang?: string; // Expect 'ja' or 'en'
}

export async function POST(req: Request) {
  try {
    // Cast the destructured body to the defined interface for better type safety
    const { message, location, topic, lang: rawLang } = (await req.json()) as RequestBody;

    // Validate essential fields
    if (!message || !location) {
      return NextResponse.json(
        { error: "Missing message or location" },
        { status: 400 }
      );
    }

    // Explicitly define the accepted language type
    type LanguageKey = 'ja' | 'en';

    // 1. **FIX for the 'any' type error and adding validation:**
    // Ensure the language is a valid key, default to 'en' if missing or invalid.
    const lang: LanguageKey = (rawLang === 'ja' || rawLang === 'en') ? rawLang : 'en';


    const weatherApiKey = process.env.WEATHERAPI_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!weatherApiKey || !geminiKey) {
      return NextResponse.json(
        { error: "Missing API keys" },
        { status: 500 }
      );
    }

    // ---------------- WEATHER API ----------------
    // Use the validated/defaulted 'lang' variable for the API call
    const weatherRes = await fetch(
      // The API call logic for lang is simplified since 'lang' is now a validated LanguageKey
      `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${encodeURIComponent(
        location
      )}&lang=${lang === "ja" ? "ja" : "en"}`
    );

    if (!weatherRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch weather" },
        { status: 500 }
      );
    }

    const weatherData = await weatherRes.json();

    const weather = {
      city: weatherData.location?.name,
      region: weatherData.location?.region,
      country: weatherData.location?.country,
      temp: weatherData.current?.temp_c,
      feels: weatherData.current?.feelslike_c,
      desc: weatherData.current?.condition?.text,
      is_day: weatherData.current?.is_day === 1,
    };

    // ---------------- PROMPT ----------------

    // 2. **Type the prompts object with LanguageKey**
    const prompts: Record<LanguageKey, string> = {
      ja: `
あなたはスマート旅行・お出かけアシスタントAIです。
ユーザーの質問、現在の天気、そしてトピック (${topic}) に基づいて最適な提案をしてください。

● ユーザーのリクエスト:
${message}

● 天気情報:
- 都市: ${weather.city}, ${weather.region}, ${weather.country}
- 気温: ${weather.temp}°C (体感: ${weather.feels}°C)
- 天気: ${weather.desc}
- 時間帯: ${weather.is_day ? "昼" : "夜"}

● 回答フォーマット:
1) おすすめの場所やアクティビティ
2) 服装・持ち物のアドバイス
3) 天気に関する注意点

短く分かりやすく、日本語で回答してください。
`,

      en: `
You are a smart travel & outing assistant AI.
Based on the user's message, weather conditions, and selected topic (${topic}), suggest the best plan.

● User question:
${message}

● Weather:
- City: ${weather.city}, ${weather.region}, ${weather.country}
- Temp: ${weather.temp}°C (feels: ${weather.feels}°C)
- Condition: ${weather.desc}
- Time: ${weather.is_day ? "day" : "night"}

● Output:
1) Recommended places / activities
2) Outfit and item suggestions
3) Weather-related cautions

Keep the tone simple and friendly.
`,
    };

    // The TS error is now resolved because 'lang' is explicitly typed as 'ja' | 'en'
    const prompt = prompts[lang];

    // ---------------- GEMINI CALL ----------------
    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!geminiRes.ok) {
      console.error("Gemini API Error:", await geminiRes.text());
      return NextResponse.json(
        { error: "Failed to call Gemini" },
        { status: 500 }
      );
    }

    const geminiJson = await geminiRes.json();
    const reply =
      geminiJson.candidates?.[0]?.content?.parts?.[0]?.text ??
      (lang === "ja"
        ? "プラン生成に失敗しました。もう一度お試しください。"
        : "Failed to generate a plan. Try again.");

    return NextResponse.json({ reply, weather });
  } catch (err) {
    console.error("Chat Route Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}