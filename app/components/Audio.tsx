"use client";

import { FiMic, FiMicOff } from "react-icons/fi";
import { useState, forwardRef } from "react";

// --- Type Definitions (Kept for TypeScript safety) ---
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
          relative flex items-center justify-center gap-2 
          rounded-xl px-4 py-2.5 
          text-sm font-semibold transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2
          
          /* Conditional Styling based on Listening State */
          ${
            listening
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/40 ring-rose-400 ring-offset-white dark:ring-offset-slate-900 cursor-default"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-md dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          }
        `}
      >
        {/* Animated Ping Effect when Listening */}
        {listening && (
          <span className="absolute -right-1 -top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500"></span>
          </span>
        )}

        <div
          className={`transition-transform duration-300 ${
            listening ? "scale-110" : "scale-100"
          }`}
        >
          {listening ? <FiMicOff size={18} /> : <FiMic size={18} />}
        </div>

        <span>
          {listening
            ? lang === "ja"
              ? "録音中..."
              : "Listening..."
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
