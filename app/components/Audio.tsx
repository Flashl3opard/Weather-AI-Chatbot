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
    recog.interimResults = false; // Add for better result handling

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
      style={{
        padding: "10px 16px",
        borderRadius: "12px", // Use CSS variables for theme compatibility
        background: listening ? "var(--bg-mic-active)" : "var(--bg-button)",
        color: "white",
        fontSize: "14px",
        fontWeight: 600,
        border: "none",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
      }}
    >
            <FiMic />     {" "}
      {listening
        ? lang === "ja"
          ? "録音中..."
          : "Listening…"
        : lang === "ja"
        ? "音声入力"
        : "Voice"}
         {" "}
    </button>
  );
}
