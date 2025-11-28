"use client";

import { FiLoader, FiVolume2 } from "react-icons/fi";
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
    <div
      className="
        flex-1 overflow-y-auto px-3 sm:px-4 py-4 
        flex flex-col gap-3
      "
      style={{ background: "var(--bg-main)" }}
    >
      {/* Empty State */}
      {messages.length === 0 && (
        <div className="text-center mt-[20vh] px-4">
          <h2
            className="text-lg sm:text-xl font-semibold"
            style={{ color: "var(--color-text-chat)" }}
          >
            {translations.startTitle}
          </h2>
          <p
            className="text-sm sm:text-base mt-2"
            style={{ color: "var(--color-text-secondary)", opacity: 0.8 }}
          >
            {translations.startSub}
          </p>
        </div>
      )}

      {/* Messages */}
      {messages.map((m, i) => (
        <div
          key={i}
          className={`flex ${
            m.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className="
              relative p-3 sm:p-4 rounded-xl text-sm sm:text-[15px] leading-[1.4]
              max-w-[85%] sm:max-w-[70%] md:max-w-[60%]
              break-words
            "
            style={{
              background:
                m.role === "user"
                  ? "var(--color-primary)"
                  : "var(--bg-bot-message)",
              color:
                m.role === "user"
                  ? "var(--color-bubble-user-text)"
                  : "var(--color-text-chat)",
              border:
                m.role === "bot" ? "1px solid var(--border-input)" : "none",
            }}
          >
            {m.text}

            {m.role === "bot" && (
              <button
                onClick={() => onSpeak(m.text)}
                className="
                  absolute bottom-0 right-[-30px]
                  flex items-center justify-center
                  p-1 cursor-pointer 
                  opacity-70 hover:opacity-100 transition
                "
                style={{ color: "var(--color-text-secondary)" }}
              >
                <FiVolume2 size={18} />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Loading */}
      {isLoading && (
        <div
          className="
            flex items-center gap-2 w-fit 
            p-3 sm:p-4 rounded-xl text-sm sm:text-[15px]
            border
          "
          style={{
            background: "var(--bg-bot-message)",
            borderColor: "var(--border-input)",
            color: "var(--color-text-secondary)",
          }}
        >
          <FiLoader size={20} className="animate-spin" />
          <span>{translations.startTitle}</span>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
