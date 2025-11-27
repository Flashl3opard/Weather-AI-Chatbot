"use client";

import { useState, useEffect } from "react";
import { FiSun, FiMoon, FiGlobe } from "react-icons/fi";
import VoiceInput from "./components/Audio";
import Chat, { ChatMessage } from "./components/Chat";
import { ChatInput } from "./components/Input";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  const [lat, setLat] = useState<number | null>(35.6895);
  const [lon, setLon] = useState<number | null>(139.6917);

  const [locationInput, setLocationInput] = useState("Tokyo");
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
      appTitle: "AtmosAI",
      locationUpdated: "Location updated!",
      geoNotSupported: "Geolocation not supported.",
      geoFailedPrefix: "Failed to get location: ",
      locationBtn: "📍 Use Current Location",
      startTitle: "",
      startSub: "Ask me about weather anywhere — or use your current location.",
      inputPlaceholder: "Type your question…",
      sendLabel: "Send",
      locationPromptBot: "Geolocation not supported. Please provide a city.",
      locationErrorBotPrefix: "Failed to get location: ",
      locationPlaceholder: "Enter City or Region",
    },

    ja: {
      appTitle: "天気アシスタント",
      locationUpdated: "位置情報を更新しました！",
      geoNotSupported: "位置情報がサポートされていません。",
      geoFailedPrefix: "位置情報の取得に失敗しました: ",
      locationBtn: "📍 現在地を使用",
      startTitle: "会話を始めましょう",
      startSub: "都市の天気について聞くか現在地を使用してください。",
      inputPlaceholder: "質問を書いてください…",
      sendLabel: "送信",
      locationPromptBot:
        "位置情報がサポートされていません。都市名を指定してください。",
      locationErrorBotPrefix: "位置情報の取得に失敗しました: ",
      locationPlaceholder: "都市または地域を入力",
    },
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light-mode", "dark-mode");
    root.classList.add(themeMode === "dark" ? "dark-mode" : "light-mode");

    root.style.setProperty("--bg-main", "var(--bg-primary)");
    root.style.setProperty("--bg-input", "var(--bg-input)");
    root.style.setProperty("--border-input", "var(--border-input)");
    root.style.setProperty("--color-text-chat", "var(--color-text)");
    root.style.setProperty("--color-text-header", "var(--color-text)");
    root.style.setProperty("--color-text-secondary", "var(--color-subtext)");

    root.style.setProperty("--bg-button", "var(--bg-button)");
    root.style.setProperty("--color-button-text", "var(--color-button-text)");
    root.style.setProperty("--color-primary", "var(--color-bubble-user)");
    root.style.setProperty("--bg-user-bubble", "var(--color-bubble-user)");
    root.style.setProperty("--bg-bot-message", "var(--bg-bubble-bot)");
    root.style.setProperty("--bg-mic-active", "var(--color-mic-active)");
  }, [themeMode]);

  function speak(text: string) {
    if (!text) return;
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

        alert(translations[lang].locationUpdated);
      },
      (err) => alert(translations[lang].geoFailedPrefix + err.message),
      { timeout: 8000, enableHighAccuracy: true }
    );
  }

  function handleLocationChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newLoc = e.target.value;
    setLocationInput(newLoc);
    setLocationName(newLoc);

    setLat(null);
    setLon(null);
  }

  function buildLocationPayload() {
    if (lat !== null && lon !== null) {
      return { lat, lon };
    }
    return { location: locationInput };
  }

  async function sendMessage(input: string) {
    if (!input.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setIsLoading(true);

    const payload = {
      message: input,
      theme,
      lang,
      ...buildLocationPayload(),
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      const reply = data.reply ?? (lang === "ja" ? "応答なし" : "No response.");

      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (err) {
      console.error(err);
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

  const toggleTheme = () =>
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));

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
      }}
    >
      {/* HEADER */}
      <div style={{ padding: "16px 24px", color: "var(--color-text-header)" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: 700,
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          {translations[lang].appTitle}
        </h1>

        <p
          style={{
            opacity: 0.9,
            marginTop: "4px",
            fontSize: "14px",
            color: "var(--color-text-secondary)",
          }}
        >
          📍 {locationName} • {themeIcons[theme]}{" "}
          {theme.charAt(0).toUpperCase() + theme.slice(1)}
        </p>
      </div>

      {/* CONTROLS */}
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
        {/* THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          style={{
            padding: "10px",
            borderRadius: "12px",
            background: "var(--bg-button)",
            color: "var(--color-button-text)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {themeMode === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
        </button>

        {/* LOCATION INPUT */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexGrow: 1,
            maxWidth: "400px",
            minWidth: "200px",
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
              background: "var(--bg-main)",
              color: "var(--color-text-chat)",
              minWidth: 0,
            }}
          />

          <button
            onClick={getLocation}
            style={{
              padding: "10px 16px",
              borderRadius: "12px",
              background: "var(--bg-user-bubble)",
              color: "var(--color-bubble-user-text)",
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
              fontSize: "14px",
            }}
          >
            {translations[lang].locationBtn}
          </button>
        </div>

        {/* THEME SELECT */}
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          style={{
            padding: "10px 16px",
            borderRadius: "12px",
            border: "1px solid var(--border-input)",
            background: "var(--bg-main)",
            color: "var(--color-text-chat)",
            minWidth: "150px",
            flexShrink: 0,
          }}
        >
          {Object.keys(themeIcons).map((key) => (
            <option key={key} value={key}>
              {themeIcons[key]} {key.charAt(0).toUpperCase() + key.slice(1)}
            </option>
          ))}
        </select>

        {/* LANGUAGE TOGGLE */}
        <button
          onClick={() => setLang((prev) => (prev === "en" ? "ja" : "en"))}
          style={{
            padding: "10px 12px",
            borderRadius: "12px",
            background: "var(--bg-button)",
            color: "var(--color-button-text)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "14px",
            flexShrink: 0,
          }}
        >
          <FiGlobe size={20} />
          {lang === "en" ? "日本語" : "EN"}
        </button>
      </div>

      {/* CHAT WINDOW */}
      <Chat
        messages={messages}
        isLoading={isLoading}
        onSpeak={speak}
        translations={translations[lang]}
      />

      {/* CHAT INPUT with VoiceInput component passed as a prop */}
      <ChatInput
        onSend={sendMessage}
        isLoading={isLoading}
        placeholder={translations[lang].inputPlaceholder}
        sendLabel={translations[lang].sendLabel}
        voiceInput={<VoiceInput lang={lang} onResult={sendMessage} />}
      />
    </div>
  );
}
