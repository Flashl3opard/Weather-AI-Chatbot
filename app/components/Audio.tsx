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

      recog.onerror = () => setListening(false);
      recog.onend = () => setListening(false);
    }

    return (
      <button
        ref={ref}
        onClick={startListening}
        disabled={listening}
        className={`
          flex items-center justify-center gap-2 
          font-semibold transition-all select-none
          rounded-xl flex-shrink-0
          
          /* Responsive padding */
          px-3 py-2 text-sm
          sm:px-4 sm:py-2.5 sm:text-base

          /* Colors from theme */
          ${listening ? "text-white" : ""}
        `}
        style={{
          background: listening
            ? "var(--color-mic-active)"
            : "var(--bg-button)",
          color: listening ? "white" : "var(--color-button-text)",
          cursor: listening ? "default" : "pointer",
        }}
      >
        <FiMic size={18} className="shrink-0" />
        <span>
          {listening
            ? lang === "ja"
              ? "録音中..."
              : "Listening…"
            : lang === "ja"
            ? "音声入力"
            : "Voice"}
        </span>
      </button>
    );
  }
);

VoiceInput.displayName = "VoiceInput";
export default VoiceInput;
