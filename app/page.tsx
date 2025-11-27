"use client";

import { useState, useRef, useEffect } from "react";
import {
  FiMic,
  FiMapPin,
  FiGlobe,
  FiSend,
  FiSun,
  FiMoon,
  FiVolume2,
  FiLoader,
} from "react-icons/fi";

type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [lang, setLang] = useState<"en" | "ja">("en");
  const [locationName, setLocationName] = useState("Tokyo");
  const [topic, setTopic] = useState("general");
  const [isListening, setIsListening] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // --- Theme Application Logic ---
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const style = document.createElement("style");
      style.innerHTML = spinKeyframes;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  const clearInput = () => {
    const el = document.querySelector("input") as HTMLInputElement;
    if (el) el.value = "";
  };

  const voiceInput = () => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browser does not support voice recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === "ja" ? "ja-JP" : "en-US";
    recognition.interimResults = false;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      sendMessage(text);
    };

    recognition.onerror = (e: any) => {
      console.error(e);
      setIsListening(false);
      alert(lang === "ja" ? "音声入力エラー。" : "Voice input error.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const speak = (text: string) => {
    if (typeof window.speechSynthesis === "undefined" || !text) return;

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === "ja" ? "ja-JP" : "en-US";

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  const sendMessage = async (input: string) => {
    const userText = input.trim();
    if (!userText || isLoading) return;

    clearInput();

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, theme: topic, lang }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.reply ?? "No response" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            lang === "ja"
              ? "❌ エラーが発生しました。"
              : "❌ Something went wrong.",
        },
      ]);
    }

    setIsLoading(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const inputElement = e.target as HTMLInputElement;
      sendMessage(inputElement.value);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "var(--bg-primary)", // Using CSS variable
        display: "flex",
        flexDirection: "column",
        transition: "background 0.3s",
        fontFamily: "Inter, sans-serif",
        color: "var(--color-text)", // Using CSS variable
      }}
    >
      <header
        style={{
          background: "var(--bg-header)", // Using CSS variable
          padding: "20px 28px",
          borderBottom: "1px solid var(--border-primary)", // Using CSS variable
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--color-text)", // Using CSS variable
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          🌤 Weather Assistant
        </h1>
        <p
          style={{
            margin: "6px 0 0 0",
            color: "var(--color-subtext)", // Using CSS variable
            fontSize: "14px",
          }}
        >
          📍 {locationName} • {topic.toUpperCase()}
        </p>
      </header>

      <div
        style={{
          padding: "12px 24px",
          background: "var(--bg-header)", // Using CSS variable
          borderBottom: "1px solid var(--border-primary)", // Using CSS variable
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <button
          onClick={voiceInput}
          style={{
            padding: "10px 16px",
            background: isListening
              ? "var(--color-mic-active)"
              : "var(--bg-button)", // Using CSS variable
            color: isListening ? "white" : "var(--color-button-text)", // Using CSS variable
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 600,
            border: "none",
            transition: "background 0.2s, color 0.2s",
          }}
        >
          <FiMic
            style={isListening ? { animation: "spin 1s linear infinite" } : {}}
          />
          {lang === "ja" ? "音声" : "Voice"}
        </button>

        <button
          onClick={() => alert("location") || {}}
          style={{
            padding: "10px 16px",
            background: "var(--bg-button)",
            color: "var(--color-button-text)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 600,
            border: "none",
          }}
        >
          <FiMapPin />
          {lang === "ja" ? "位置" : "Location"}
        </button>

        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          style={{
            padding: "10px 16px",
            background: "var(--bg-button)",
            color: "var(--color-button-text)",
            borderRadius: "10px",
            fontWeight: 600,
            border: "none",
          }}
        >
          <option value="general">General</option>
          <option value="travel">Travel</option>
          <option value="fashion">Fashion</option>
          <option value="outings">Outings</option>
        </select>

        <button
          onClick={() => setLang((l) => (l === "en" ? "ja" : "en"))}
          style={{
            marginLeft: "auto",
            padding: "10px 16px",
            background: "var(--bg-button)",
            color: "var(--color-button-text)",
            borderRadius: "10px",
            fontWeight: 700,
            border: "none",
          }}
        >
          {lang === "en" ? "EN" : "日本語"}
        </button>

        <button
          onClick={() =>
            setThemeMode((t) => (t === "light" ? "dark" : "light"))
          }
          style={{
            padding: "10px",
            background: "var(--bg-button)",
            borderRadius: "10px",
            border: "none",
            color: "var(--color-button-text)",
          }}
        >
          {themeMode === "light" ? <FiMoon /> : <FiSun />}
        </button>
      </div>

      <div
        style={{
          flexGrow: 1,
          overflowY: "auto",
          padding: "22px",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              marginTop: "80px",
              color: "var(--color-subtext)",
            }}
          >
            <h2 style={{ fontSize: "18px", margin: 0 }}>
              {lang === "ja" ? "会話を始めましょう" : "Start a conversation"}
            </h2>
            <p style={{ fontSize: "14px", marginTop: 8 }}>
              {lang === "ja"
                ? "天気やコーディネートについて聞いてみてください。"
                : "Ask about weather, plans, or outfit ideas."}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                maxWidth: "75%",
                padding: "12px 16px",
                borderRadius: "14px",
                background:
                  msg.role === "user"
                    ? "var(--color-bubble-user)"
                    : "var(--bg-bubble-bot)",
                color:
                  msg.role === "user"
                    ? "var(--color-bubble-user-text)"
                    : "var(--color-text)",
                border:
                  msg.role === "bot"
                    ? "1px solid var(--border-bubble-bot)"
                    : "none",
                fontSize: "15px",
                lineHeight: "1.45",
              }}
            >
              {msg.text}

              {msg.role === "bot" && (
                <button
                  onClick={() => speak(msg.text)}
                  style={{
                    marginLeft: "8px",
                    border: "none",
                    background: "transparent",
                    color: "var(--color-bot-speak)",
                    cursor: "pointer",
                    verticalAlign: "middle",
                  }}
                >
                  <FiVolume2 style={{ display: "inline-block" }} />
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ color: "var(--color-subtext)", padding: "10px" }}>
            <FiLoader style={{ animation: "spin 1s linear infinite" }} />
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--border-primary)",
          background: "var(--bg-input)",
          display: "flex",
          gap: "12px",
        }}
      >
        <input
          placeholder={
            lang === "ja" ? "質問を書いてください…" : "Type your question…"
          }
          onKeyDown={handleInputKeyDown}
          style={{
            flexGrow: 1,
            padding: "12px 16px",
            background: "var(--bg-input)",
            border: "1px solid var(--border-input)",
            color: "var(--color-text)",
            borderRadius: "12px",
            fontSize: "15px",
          }}
        />

        <button
          onClick={() => {
            const el = document.querySelector("input") as HTMLInputElement;
            if (el && el.value.trim()) {
              sendMessage(el.value);
            }
          }}
          style={{
            padding: "12px 18px",
            background: "var(--color-send-button, #10B981)",
            color: "white",
            borderRadius: "12px",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
}
