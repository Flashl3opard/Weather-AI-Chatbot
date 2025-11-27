
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query, city, lang } = await req.json();

    const weatherApiKey = process.env.WEATHERAPI_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!weatherApiKey || !geminiKey) {
      return NextResponse.json(
        { error: "Missing API keys" },
        { status: 500 }
      );
    }

    const weatherRes = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${encodeURIComponent(
        city
      )}&lang=ja`
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

    const systemPromptJa = `
あなたは旅行プランナーAIです。以下の情報に基づいて、日帰りや短いお出かけプランを日本語で提案してください。

- ユーザーのリクエスト: ${query}
- 天気情報:
  都市: ${weather.city} (${weather.region}, ${weather.country})
  気温: ${weather.temp}°C
  体感温度: ${weather.feels}°C
  状況: ${weather.desc}
  昼/夜: ${weather.is_day ? "昼" : "夜"}

出力フォーマット:
1) おすすめの場所やアクティビティ
2) 服装・持ち物のアドバイス
3) 天気に関する注意点
`;

    const systemPromptEn = `
You are a travel planner AI. Based on the following, suggest a short outing or day trip plan in English.

- User request: ${query}
- Weather information:
  City: ${weather.city} (${weather.region}, ${weather.country})
  Temperature: ${weather.temp}°C
  Feels like: ${weather.feels}°C
  Condition: ${weather.desc}
  Time: ${weather.is_day ? "daytime" : "night"}

Output format:
1) Recommended places/activities
2) Outfit and items to bring
3) Weather-related cautions
`;

    const prompt = lang === "ja" ? systemPromptJa : systemPromptEn;

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
      return NextResponse.json(
        { error: "Failed to call Gemini" },
        { status: 500 }
      );
    }

    const geminiJson = await geminiRes.json();
    const suggestion =
      geminiJson.candidates?.[0]?.content?.parts?.[0]?.text ??
      (lang === "ja"
        ? "プランの生成に失敗しました。もう一度お試しください。"
        : "Failed to generate a plan. Please try again.");

    return NextResponse.json({ weather, suggestion });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
