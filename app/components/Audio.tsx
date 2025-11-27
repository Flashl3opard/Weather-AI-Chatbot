"use client";

import { FiMic } from "react-icons/fi";
import { useState } from "react";

export default function VoiceInput({
  onResult,
  lang,
}: {
  onResult: (text: string) => void;
  lang: "en" | "ja";
}) {
  const [listening, setListening] = useState(false);

  function startListening() {
    const SR =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SR) {
      alert(
        lang === "ja"
          ? "音声入力がサポートされていません。"
          : "Voice input not supported"
      );
      return;
    }

    const recog = new SR();
    recog.lang = lang === "ja" ? "ja-JP" : "en-US";
    recog.interimResults = false;

    setListening(true);
    recog.start();

    recog.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      onResult(text);
    };

    recog.onerror = () => setListening(false);
    recog.onend = () => setListening(false);
  }

  return (
    <button
      onClick={startListening}
      disabled={listening}
      style={{
        padding: "10px 16px",
        borderRadius: "12px",
        // Use global CSS variables: --color-mic-active and --bg-button
        background: listening ? "var(--color-mic-active)" : "var(--bg-button)",
        // Use text color from global CSS (assuming white is appropriate here, or define a new var)
        color: listening ? "white" : "var(--color-button-text)",
        fontSize: "14px",
        fontWeight: 600,
        border: "none",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: listening ? "default" : "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <FiMic size={18} />
      {listening
        ? lang === "ja"
          ? "録音中..."
          : "Listening…"
        : lang === "ja"
        ? "音声入力"
        : "Voice"}
    </button>
  );
}
