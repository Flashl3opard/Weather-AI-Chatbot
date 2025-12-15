"use client";

import React, { useState, useRef, useEffect, LegacyRef } from "react";
import { FiSend, FiCommand, FiMic } from "react-icons/fi";

// --- Type Definitions ---
type VoiceButtonRef = LegacyRef<HTMLButtonElement> | undefined;

interface ChatInputProps {
  onSend: (input: string) => void;
  isLoading: boolean;
  placeholder: string;
  sendLabel: string;
  voiceInput: React.ReactElement<{ ref?: VoiceButtonRef } & any>;
}

export function ChatInput({
  onSend,
  isLoading,
  placeholder,
  sendLabel,
  voiceInput,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const voiceButtonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput("");
  };

  // Keyboard Shortcut: ⌥ / Alt + A → Voice
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.code === "KeyA") {
        event.preventDefault();
        voiceButtonRef.current?.click();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const renderVoiceWithRef = () =>
    React.isValidElement(voiceInput)
      ? React.cloneElement(voiceInput as any, { ref: voiceButtonRef })
      : voiceInput;

  const hasText = input.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="relative w-full px-4 pb-4">
      {/* Outer Glow Container */}
      <div
        className="
          relative flex items-center gap-3
          rounded-3xl p-[2px]
          bg-gradient-to-r from-blue-500/40 via-cyan-400/30 to-indigo-500/40
          shadow-[0_0_40px_rgba(56,189,248,0.15)]
        "
      >
        {/* Inner Glass Panel */}
        <div
          className="
            flex w-full items-center gap-3
            rounded-[22px] px-4 py-3
            backdrop-blur-xl bg-white/70
            dark:bg-slate-900/70
            border border-white/40 dark:border-white/10
          "
        >
          {/* Command Hint */}
          <div className="hidden sm:flex items-center gap-1 text-xs opacity-50">
            <FiCommand /> Enter
          </div>

          {/* Input */}
          <input
            type="text"
            value={input}
            disabled={isLoading}
            placeholder={placeholder}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="
              flex-1 bg-transparent outline-none
              text-base font-medium
              text-slate-900 placeholder-slate-500
              dark:text-slate-100 dark:placeholder-slate-400
            "
          />

          {/* Voice */}
          <div
            className="
              relative flex items-center justify-center
              rounded-full p-2
              bg-slate-200/60 dark:bg-slate-800/60
              hover:scale-105 transition
            "
            title="Alt + A"
          >
            {renderVoiceWithRef()}
            <span className="absolute -bottom-5 text-[10px] opacity-40">
              Alt+A
            </span>
          </div>

          {/* Send */}
          <button
            type="submit"
            disabled={!hasText || isLoading}
            className={`
              relative flex items-center gap-2
              rounded-full px-5 py-3 font-semibold
              transition-all duration-300
              ${
                hasText && !isLoading
                  ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-[0_0_25px_rgba(99,102,241,0.6)] hover:scale-105 active:scale-95"
                  : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
              }
            `}
          >
            <FiSend className="transition-transform group-hover:translate-x-1" />
            <span className="hidden sm:inline">{sendLabel}</span>

            {/* Pulse Ring */}
            {hasText && (
              <span className="absolute inset-0 -z-10 rounded-full animate-ping bg-indigo-500/20" />
            )}
          </button>
        </div>
      </div>

      {/* AI Status */}
      <div className="mt-2 text-center text-xs opacity-40">
        ⚡ Powered by Gemini · Voice Enabled · Low-latency
      </div>
    </form>
  );
}
