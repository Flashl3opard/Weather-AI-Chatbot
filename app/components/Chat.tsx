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
  translations: any;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div
      style={{
        flex: 1,
        padding: "22px",
        overflowY: "auto",
        background: "rgba(255,255,255,0.25)",
      }}
    >
      {messages.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "80px", color: "white" }}>
          <h2 style={{ fontSize: "18px" }}>{translations.startTitle}</h2>
          <p style={{ opacity: 0.8 }}>{translations.startSub}</p>
        </div>
      )}

      {messages.map((m, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              maxWidth: "70%",
              padding: "12px 16px",
              borderRadius: "14px",
              background: m.role === "user" ? "#4A90E2" : "white",
              color: m.role === "user" ? "white" : "#333",
              position: "relative",
            }}
          >
            {m.text}

            {m.role === "bot" && (
              <button
                onClick={() => onSpeak(m.text)}
                style={{
                  position: "absolute",
                  bottom: 4,
                  right: -40,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                <FiVolume2 />
              </button>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div style={{ color: "white" }}>
          <FiLoader style={{ animation: "spin 1s linear infinite" }} />
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
