"use client";

import { FiMic } from "react-icons/fi";
import { useState, forwardRef } from "react";

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any)
    | null;
  onnomatch:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  abort(): void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

type SpeechRecognitionConstructor = SpeechRecognitionStatic;

interface VoiceInputProps {
  onResult: (text: string) => void;
  lang: "en" | "ja";
}

const VoiceInput = forwardRef<HTMLButtonElement, VoiceInputProps>(
  ({ onResult, lang }, ref) => {
    const [listening, setListening] = useState(false);

    function startListening() {
      const SpeechRecognitionClass: SpeechRecognitionConstructor | undefined =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognitionClass) {
        alert(
          lang === "ja"
            ? "音声入力がサポートされていません。"
            : "Voice input not supported"
        );
        return;
      }

      const recog = new SpeechRecognitionClass();

      recog.lang = lang === "ja" ? "ja-JP" : "en-US";
      recog.interimResults = false;

      setListening(true);
      recog.start();

      recog.onresult = (e: SpeechRecognitionEvent) => {
        const text = e.results[0][0].transcript;
        onResult(text);
      };

      recog.onerror = () => {
        setListening(false);
      };

      recog.onend = () => {
        setListening(false);
      };
    }

    return (
      <button
        ref={ref}
        onClick={startListening}
        disabled={listening}
        style={{
          padding: "10px 16px",
          borderRadius: "12px",
          background: listening
            ? "var(--color-mic-active)"
            : "var(--bg-button)",
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
);

VoiceInput.displayName = "VoiceInput";

export default VoiceInput;
