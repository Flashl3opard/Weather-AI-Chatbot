"use client";

import { useState, useEffect } from "react";
import {
  FiSun,
  FiMoon,
  FiGlobe,
  FiMapPin,
  FiChevronDown,
  FiCpu,
  FiActivity,
} from "react-icons/fi";

import VoiceInput from "./components/Audio";
import Chat, { ChatMessage } from "./components/Chat";
import { ChatInput } from "./components/Input";

/* ------------------------------------------------------------------ */
/* THEME CONFIG                                                        */
/* ------------------------------------------------------------------ */

const themeConfig: Record<
  string,
  { bg: string; accent: string; icon: string }
> = {
  general: {
    bg: "from-blue-600/20 via-slate-900 to-cyan-900",
    accent: "text-cyan-400",
    icon: "🌍",
  },
  travel: {
    bg: "from-sky-500/20 via-indigo-950 to-emerald-900",
    accent: "text-sky-400",
    icon: "✈️",
  },
  fashion: {
    bg: "from-fuchsia-600/20 via-slate-900 to-purple-900",
    accent: "text-fuchsia-400",
    icon: "👗",
  },
  sports: {
    bg: "from-orange-500/20 via-slate-900 to-red-900",
    accent: "text-orange-400",
    icon: "⚽",
  },
  music: {
    bg: "from-violet-600/20 via-slate-900 to-indigo-900",
    accent: "text-violet-400",
    icon: "🎵",
  },
  agriculture: {
    bg: "from-lime-500/20 via-slate-900 to-green-900",
    accent: "text-lime-400",
    icon: "🌾",
  },
  outings: {
    bg: "from-yellow-500/20 via-slate-900 to-amber-900",
    accent: "text-yellow-400",
    icon: "🏞️",
  },
};

/* ------------------------------------------------------------------ */
/* TRANSLATIONS                                                        */
/* ------------------------------------------------------------------ */

const translations = {
  en: {
    appTitle: "AtmosAI",
    subtitle: "NEURAL LINK ESTABLISHED",

    /* ✅ REQUIRED BY <Chat /> */
    startTitle: "AI Core Online",
    startSub: "Awaiting commands. Weather. Travel. Decisions.",

    locationUpdated: "Coordinates Acquired",
    geoNotSupported: "Geo-Sensors Offline",
    geoFailedPrefix: "Triangulation Failed: ",
    locationBtn: "GPS SCAN",
    inputPlaceholder: "Awaiting Command...",
    sendLabel: "EXECUTE",
    locationPlaceholder: "Enter Coordinates...",
  },

  ja: {
    appTitle: "AtmosAI",
    subtitle: "ニューラルリンク接続完了",

    /* ✅ REQUIRED BY <Chat /> */
    startTitle: "AI起動完了",
    startSub: "天気・旅行・判断を指示してください",

    locationUpdated: "座標取得完了",
    geoNotSupported: "ジオセンサーオフライン",
    geoFailedPrefix: "三角測量失敗: ",
    locationBtn: "GPSスキャン",
    inputPlaceholder: "コマンド待機中...",
    sendLabel: "実行",
    locationPlaceholder: "座標 / 都市を入力...",
  },
};

/* ------------------------------------------------------------------ */
/* COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const [theme, setTheme] = useState("general");
  const [lang, setLang] = useState<"en" | "ja">("en");

  const [lat, setLat] = useState<number | null>(35.6895);
  const [lon, setLon] = useState<number | null>(139.6917);
  const [locationInput, setLocationInput] = useState("Tokyo");
  const [locationName, setLocationName] = useState("Tokyo");

  const currentTheme = themeConfig[theme] ?? themeConfig.general;
  const t = translations[lang];

  /* ------------------------------------------------------------------ */
  /* EFFECTS                                                            */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [themeMode]);

  /* ------------------------------------------------------------------ */
  /* HELPERS                                                            */
  /* ------------------------------------------------------------------ */

  function speak(text: string) {
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === "ja" ? "ja-JP" : "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  function getLocation() {
    if (!navigator.geolocation) {
      alert(t.geoNotSupported);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLon(pos.coords.longitude);
        setLocationName(
          lang === "ja" ? "現在地 (GPS)" : "Current Sector (GPS)"
        );
        alert(t.locationUpdated);
      },
      (err) => alert(t.geoFailedPrefix + err.message),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function handleLocationChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLocationInput(e.target.value);
    setLocationName(e.target.value);
    setLat(null);
    setLon(null);
  }

  async function sendMessage(input: string) {
    if (!input.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          theme,
          lang,
          ...(lat && lon ? { lat, lon } : { location: locationInput }),
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.reply ?? "No response." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "❌ CRITICAL ERROR: UPLINK FAILED" },
      ]);
    }

    setIsLoading(false);
  }

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Ambient Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${currentTheme.bg} opacity-60 transition-all duration-1000`}
      />

      <div className="z-10 mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden bg-white/5 backdrop-blur-2xl ring-1 ring-white/10 sm:my-6 sm:h-[95vh] sm:rounded-3xl">
        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-white/10 bg-black/20 px-6 py-4">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ${currentTheme.accent}`}
            >
              <FiCpu size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                {t.appTitle}
              </h1>
              <p className="text-[10px] font-bold tracking-widest text-slate-400">
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setThemeMode((p) => (p === "light" ? "dark" : "light"))
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10"
            >
              {themeMode === "dark" ? (
                <FiSun className="text-yellow-300" />
              ) : (
                <FiMoon />
              )}
            </button>

            <button
              onClick={() => setLang((p) => (p === "en" ? "ja" : "en"))}
              className="flex h-10 items-center gap-2 rounded-xl bg-white/5 px-4 text-xs font-bold tracking-widest"
            >
              <FiGlobe /> {lang === "en" ? "JPN" : "ENG"}
            </button>
          </div>
        </header>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-4 border-b border-white/10 bg-black/10 px-6 py-4">
          <div className="flex flex-1 items-center rounded-xl border border-white/10 bg-black/20">
            <div className={`pl-4 ${currentTheme.accent}`}>
              <FiMapPin />
            </div>
            <input
              value={locationInput}
              onChange={handleLocationChange}
              placeholder={t.locationPlaceholder}
              className="w-full bg-transparent px-3 py-3 text-sm outline-none"
            />
            <button
              onClick={getLocation}
              className="mr-2 rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-bold"
            >
              {t.locationBtn}
            </button>
          </div>

          <div className="relative min-w-[180px]">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 pr-10 text-sm font-bold uppercase"
            >
              {Object.keys(themeConfig).map((key) => (
                <option key={key} value={key}>
                  {themeConfig[key].icon} {key}
                </option>
              ))}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
          </div>

          <div className="hidden items-center gap-2 text-xs uppercase text-slate-500 md:flex">
            <FiActivity /> Sector: {locationName}
          </div>
        </div>

        {/* CHAT */}
        <main className="flex-1 overflow-hidden">
          <Chat
            messages={messages}
            isLoading={isLoading}
            onSpeak={speak}
            translations={{
              startTitle: t.startTitle,
              startSub: t.startSub,
            }}
          />
        </main>

        {/* INPUT */}
        <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl">
          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
            placeholder={t.inputPlaceholder}
            sendLabel={t.sendLabel}
            voiceInput={<VoiceInput lang={lang} onResult={sendMessage} />}
          />
        </footer>
      </div>
    </div>
  );
}
