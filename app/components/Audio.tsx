"use client";

import { FiMic } from "react-icons/fi";
import { useState } from "react";

// 1. Declare the necessary interfaces on the global window object
// This ensures webkitSpeechRecognition is recognized without 'any'.
declare global {
  interface Window {
    webkitSpeechRecognition: typeof SpeechRecognition;
    SpeechRecognition: typeof SpeechRecognition;
  }
}

// NOTE: Since the SpeechRecognition interface is part of the standard DOM library
// which is usually included in a modern TypeScript/Next.js setup, we typically
// don't need to define the type itself, just the window properties.

export default function VoiceInput({
  onResult,
  lang,
}: {
  onResult: (text: string) => void;
  lang: "en" | "ja";
}) {
  const [listening, setListening] = useState(false);

  function startListening() {
    // 2. Access the SpeechRecognition constructor safely
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        lang === "ja"
          ? "音声入力がサポートされていません。"
          : "Voice input not supported"
      );
      return;
    }

    // 3. Use the SpeechRecognition type directly
    const recog = new SpeechRecognition();
    recog.lang = lang === "ja" ? "ja-JP" : "en-US";
    recog.interimResults = false;

    setListening(true);
    recog.start();

    // 4. Use the correct event type for onresult (SpeechRecognitionEvent)
    recog.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[0][0].transcript;
      onResult(text);
    };

    // 5. Use the correct, explicit event type for onerror
    // Parameter 'e' implicitly has an 'any' type -> use SpeechRecognitionErrorEvent
    recog.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error(e);
      setListening(false);
    };

    // 6. Use the correct, explicit event type for onend
    // Parameter 'e' implicitly has an 'any' type -> use Event
    recog.onend = (e: Event) => {
      setListening(false);
    };
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
