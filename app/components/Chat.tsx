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
      style={{
        flex: 1,
        padding: "16px",
        overflowY: "auto",
        background: "var(--bg-main)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {messages.length === 0 && (
        <div
          style={{
            textAlign: "center",
            marginTop: "20vh",
            color: "var(--color-text-chat)",
            padding: "20px",
          }}
        >
          <h2 style={{ fontSize: "1.2rem" }}>{translations.startTitle}</h2>
          <p style={{ opacity: 0.8, color: "var(--color-text-secondary)" }}>
            {translations.startSub}
          </p>
        </div>
      )}

      {messages.map((m, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
          }}
        >
          <div
            style={{
              maxWidth: "85%",
              padding: "12px 16px",
              borderRadius: "14px",
              fontSize: "15px",
              lineHeight: "1.4",
              background:
                m.role === "user"
                  ? "var(--color-primary)"
                  : "var(--bg-bot-message, #fff)",
              color: m.role === "user" ? "white" : "var(--color-text-chat)",
              position: "relative",
              border:
                m.role === "bot" ? "1px solid var(--border-input)" : "none",
              wordBreak: "break-word",
            }}
          >
            {m.text}

            {m.role === "bot" && (
              <button
                onClick={() => onSpeak(m.text)}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: -36,
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                  padding: "0 4px",
                  opacity: 0.8,
                  transition: "opacity 0.2s",
                }}
              >
                <FiVolume2 size={18} />
              </button>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 16px",
            width: "fit-content",
            borderRadius: "14px",
            background: "var(--bg-bot-message, #fff)",
            border: "1px solid var(--border-input)",
            color: "var(--color-text-secondary)",
          }}
        >
          <FiLoader size={20} style={{ marginRight: "8px" }} />
          <span>{translations.startTitle}</span>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
