"use client";

import { FiVolume2, FiCpu, FiUser, FiZap } from "react-icons/fi";
import { useRef, useEffect } from "react";

export type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

export default function Chat({
  messages,
  isLoading,
  onSpeak,
  translations,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  onSpeak: (text: string) => void;
  translations: {
    startTitle: string;
    startSub: string;
  };
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="relative flex-1 overflow-y-auto px-4 py-6 sm:px-6">
      {/* Ambient Gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />

      {/* EMPTY / HERO STATE */}
      {messages.length === 0 && !isLoading && (
        <div className="flex h-full flex-col items-center justify-center text-center animate-[fadeIn_0.6s_ease-out]">
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/30" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_40px_rgba(99,102,241,0.6)]">
              <FiZap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {translations.startTitle || "AI Ready"}
          </h2>
          <p className="mt-2 max-w-sm text-sm opacity-60">
            {translations.startSub ||
              "Ask anything. Weather. Travel. Decisions."}
          </p>
        </div>
      )}

      {/* MESSAGES */}
      <div className="relative z-10 flex flex-col gap-8">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex w-full items-end gap-3 ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {/* AVATAR */}
            {m.role === "bot" && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                <FiCpu size={14} />
              </div>
            )}

            {/* BUBBLE */}
            <div
              className={`group relative max-w-[85%] rounded-3xl px-6 py-4 text-[15px] leading-relaxed transition-all sm:max-w-[75%] md:max-w-[65%]
                ${
                  m.role === "user"
                    ? "rounded-br-md bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-[0_0_25px_rgba(56,189,248,0.45)]"
                    : "rounded-bl-md bg-white/70 backdrop-blur-xl border border-white/40 text-slate-800 shadow-lg dark:bg-slate-900/70 dark:border-white/10 dark:text-slate-100"
                }
              `}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* BOT ACTIONS */}
              {m.role === "bot" && (
                <button
                  onClick={() => onSpeak(m.text)}
                  className="absolute -right-10 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-slate-500 opacity-0 backdrop-blur-md transition-all hover:scale-110 hover:text-blue-600 group-hover:opacity-100 dark:bg-slate-800/70 dark:text-slate-400 dark:hover:text-blue-400"
                  title="Read aloud"
                >
                  <FiVolume2 size={15} />
                </button>
              )}
            </div>

            {/* USER AVATAR */}
            {m.role === "user" && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white shadow-md">
                <FiUser size={14} />
              </div>
            )}
          </div>
        ))}

        {/* LOADING / THINKING */}
        {isLoading && (
          <div className="flex w-full items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white animate-pulse">
              <FiCpu size={14} />
            </div>
            <div className="flex items-center gap-2 rounded-3xl rounded-bl-md bg-white/70 px-6 py-4 backdrop-blur-xl border border-white/40 dark:bg-slate-900/70 dark:border-white/10">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" />
              <span className="ml-2 text-xs opacity-60">Thinking…</span>
            </div>
          </div>
        )}
      </div>

      <div ref={endRef} className="h-6" />
    </div>
  );
}
