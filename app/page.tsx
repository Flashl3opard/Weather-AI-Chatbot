"use client";

import { useState, useEffect } from "react";
import { FiSun, FiMoon, FiMapPin, FiGlobe } from "react-icons/fi";
import VoiceInput from "./components/Audio";
import Chat, { ChatMessage } from "./components/Chat";
import ChatInput from "./components/Input";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  const [locationInput, setLocationInput] = useState("Tokyo");
  const [lat, setLat] = useState(35.6895);
  const [lon, setLon] = useState(139.6917);
  const [locationName, setLocationName] = useState("Tokyo");

  const [theme, setTheme] = useState("general");

  const [lang, setLang] = useState<"en" | "ja">("en");

  const themeIcons: Record<string, string> = {
    general: "🌍",
    travel: "✈",
    fashion: "👗",
    sports: "⚽",
    music: "🎵",
    agriculture: "🌾",
    outings: "🏞",
  };

  const translations = {
    en: {
      appTitle: "Weather Assistant",
      locationUpdated: "Location updated!",
      geoNotSupported: "Geolocation not supported.",
      geoFailedPrefix: "Failed to get location: ",
      locationBtn: "📍 Use Current Location",
      startTitle: "Start a conversation",
      startSub: "Ask me about weather anywhere — or use your current location.",
      speakBtn: "🔊 Speak",
      inputPlaceholder: "Type your question…",
      sendLabel: "Send",
      locationPromptBot:
        "Geolocation not supported. Please provide a city name.",
      locationErrorBotPrefix: "Failed to get location: ",
      locationPlaceholder: "Enter City or Region",
      themeTitle: "Theme",
    },
    ja: {
      appTitle: "天気アシスタント",
      locationUpdated: "位置情報を更新しました！",
      geoNotSupported: "位置情報がサポートされていません。",
      geoFailedPrefix: "位置情報の取得に失敗しました: ",
      locationBtn: "📍 現在地を使用",
      startTitle: "会話を始めましょう",
      startSub: "都市の天気について聞くか現在地を使用してください。",
      speakBtn: "🔊 再生",
      inputPlaceholder: "質問を書いてください…",
      sendLabel: "送信",
      locationPromptBot:
        "位置情報がサポートされていません。都市名を指定してください。",
      locationErrorBotPrefix: "位置情報の取得に失敗しました: ",
      locationPlaceholder: "都市または地域を入力",
      themeTitle: "テーマ",
    },
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (themeMode === "dark") {
        root.classList.add("dark-mode");
      } else {
        root.classList.remove("dark-mode");
      }
    }
  }, [themeMode]);

  function speak(text: string) {
    if (typeof window === "undefined" || !text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === "ja" ? "ja-JP" : "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  function getLocation() {
    if (!navigator.geolocation) {
      alert(translations[lang].geoNotSupported);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLon = pos.coords.longitude;
        setLat(newLat);
        setLon(newLon);
        setLocationName(
          lang === "ja" ? "現在地 (GPS)" : "Current Location (GPS)"
        );
        setLocationInput(
          lang === "ja" ? "現在地 (GPS)" : "Current Location (GPS)"
        );
        alert(translations[lang].locationUpdated);
      },
      (err) => alert(translations[lang].geoFailedPrefix + err.message),
      { timeout: 8000, enableHighAccuracy: true }
    );
  }

  function handleLocationChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newLocation = e.target.value;
    setLocationInput(newLocation);
    setLocationName(newLocation);
    setLat(0);
    setLon(0);
  }

  async function sendMessage(input: string) {
    if (!input.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setIsLoading(true);

    const locationToSend =
      lat && lon ? { lat, lon } : { location: locationInput };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          theme,
          lang,
          ...locationToSend,
        }),
      });

      const data = await res.json();

      const botReply =
        data.reply ?? (lang === "ja" ? "応答なし" : "No response");

      setMessages((prev) => [...prev, { role: "bot", text: botReply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            lang === "ja"
              ? "❌ サーバーエラーが発生しました。"
              : "❌ Server error occurred.",
        },
      ]);
    }

    setIsLoading(false);
  }

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "var(--bg-main)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
        transition: "background 0.3s ease",
      }}
    >
      <div style={{ padding: "24px", color: "var(--color-text-header)" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "36px" }}>🌤</span>
          {translations[lang].appTitle}
        </h1>
        <p style={{ margin: "8px 0 0 0", opacity: 0.9, fontSize: "14px" }}>
          📍 {locationName} • {themeIcons[theme]}{" "}
          {theme.charAt(0).toUpperCase() + theme.slice(1)}
        </p>
      </div>

      <div
        style={{
          padding: "16px 24px",
          background: "var(--bg-input)",
          borderBottom: "1px solid var(--border-input)",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
          onClick={toggleTheme}
          style={{
            padding: "10px 12px",
            borderRadius: "12px",
            border: "none",
            background: "var(--bg-button)",
            color: "var(--color-button-text)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            fontSize: "16px",
          }}
        >
          {themeMode === "light" ? <FiMoon /> : <FiSun />}
        </button>

        <VoiceInput lang={lang} onResult={sendMessage} />

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexGrow: 1,
            maxWidth: "400px",
          }}
        >
          <input
            type="text"
            placeholder={translations[lang].locationPlaceholder}
            value={locationInput}
            onChange={handleLocationChange}
            style={{
              flexGrow: 1,
              padding: "10px 12px",
              borderRadius: "12px",
              border: "1px solid var(--border-input)",
              background: "var(--bg-input)",
              color: "var(--color-text-chat)",
              fontSize: "14px",
            }}
          />
          <button
            onClick={getLocation}
            style={{
              padding: "10px 16px",
              borderRadius: "12px",
              border: "none",
              background: "var(--bg-user-bubble)",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {translations[lang].locationBtn}
          </button>
        </div>

        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          style={{
            padding: "10px 16px",
            borderRadius: "12px",
            border: "1px solid var(--border-input)",
            background: "var(--bg-input)",
            color: "var(--color-text-chat)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            minWidth: "150px",
          }}
        >
          {Object.keys(themeIcons).map((key) => (
            <option key={key} value={key}>
              {themeIcons[key]} {key.charAt(0).toUpperCase() + key.slice(1)}
            </option>
          ))}
        </select>

        <button
          onClick={() => setLang((prev) => (prev === "en" ? "ja" : "en"))}
          style={{
            padding: "10px 12px",
            borderRadius: "12px",
            border: "none",
            background: "var(--bg-button)",
            color: "var(--color-button-text)",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          <FiGlobe style={{ verticalAlign: "middle", marginRight: "4px" }} />
          {lang === "en" ? "日本語" : "EN"}
        </button>
      </div>

      <Chat
        messages={messages}
        isLoading={isLoading}
        onSpeak={speak}
        translations={translations[lang]}
      />

      <ChatInput
        onSend={sendMessage}
        isLoading={isLoading}
        placeholder={translations[lang].inputPlaceholder}
        sendLabel={translations[lang].sendLabel}
      />
    </div>
  );
}
