import { NextResponse } from "next/server";
import { getWeather } from "../../../lib/weather";

interface RequestBody {
  message?: string;
  location?: string;
  topic?: string;
  lang?: "en" | "ja";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const message = body.message?.trim();
    const location = body.location?.trim();
    const topic = body.topic ?? "general";
    const lang: "en" | "ja" = body.lang === "ja" ? "ja" : "en";

    if (!message || !location) {
      return NextResponse.json({
        reply:
          lang === "ja"
            ? "メッセージと場所を入力してください。"
            : "Please provide a message and location.",
      });
    }


    const weather = await getWeather(location, lang);

    const L = {
      en: {
        aiError: "AI returned no response.",
        intro: (city: string, topic: string) => `
You are a friendly weather-based assistant.
Answer ONLY in **English**.
User is asking about: "${message}"
City: ${city}
Topic: ${topic}

Write a reply that:
• Is VERY short (2–3 lines)
• Gives 1–2 suggestions
• Includes 1 outfit tip
• Includes 1 weather caution
• Friendly and practical
`,
      },

      ja: {
        aiError: "AIからの応答がありません。",
        intro: (city: string, topic: string) => `
あなたは親しみやすい天気アシスタントです。
返答は **必ず日本語のみ** で書いてください。

ユーザー質問: 「${message}」
都市: ${city}
テーマ: ${topic}

以下を満たす短い回答（2〜3行）を作成:
• 1〜2個のおすすめ
• 服装アドバイス 1つ
• 注意点 1つ
• シンプルで親しみやすい文
`,
      },
    };

    const t = L[lang];

    // Weather block for AI context
    const weatherBlock = `
Weather Info:
- ${weather.city}, ${weather.country}
- ${weather.temp}°C (feels ${weather.feels}°C)
- Condition: ${weather.desc}
- Time: ${weather.is_day ? "Day" : "Night"}
`;

    const finalPrompt = t.intro(weather.city, topic) + "\n" + weatherBlock;


    const gemRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: finalPrompt }] }],
          generationConfig: {
            maxOutputTokens: 120,
            temperature: 0.6,
          },
        }),
      }
    );

    if (!gemRes.ok) {
      return NextResponse.json({
        reply: lang === "ja" ? "AI応答エラー。" : "AI response error.",
      });
    }

    const data = await gemRes.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      t.aiError;

    return NextResponse.json({
      reply,
      weather,
      city: weather.city,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { reply: "Server Error. Check logs." },
      { status: 500 }
    );
  }
}
