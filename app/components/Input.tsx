"use client";

import { useState } from "react";
import { FiSend } from "react-icons/fi";

export default function ChatInput({
  onSend,
  isLoading,
  placeholder,
  sendLabel, // Not currently used but kept for completeness
}: {
  onSend: (msg: string) => void;
  isLoading: boolean;
  placeholder: string;
  sendLabel: string;
}) {
  const [text, setText] = useState("");

  function handleSend() {
    // Only send if there's text and we aren't loading
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText("");
  }

  return (
    <div
      style={{
        padding: "16px 24px",
        // Use border color variable for theme compatibility
        borderTop: "1px solid var(--border-input, #e9ecef)",
        // Use background variable for theme compatibility (main chat background is dark in dark mode)
        background: "var(--bg-input, #ffffff)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {/* TEXT INPUT */}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder={placeholder}
        style={{
          flexGrow: 1,
          padding: "12px 16px",
          fontSize: "15px",
          borderRadius: "12px",
          // Use CSS variables for theme compatibility
          border: "1px solid var(--border-input, #ddd)",
          outline: "none",
          background: "var(--bg-input, #fff)",
          color: "var(--color-text-chat, #222)", // Use chat text color
        }}
      />

      {/* SEND BUTTON */}
      <button
        onClick={handleSend}
        disabled={isLoading || !text.trim()} // Disable if no text
        style={{
          padding: "12px 18px",
          // Use a fixed color or defined variable for the main action button
          background: "#4A90E2", // Using a color that contrasts well
          color: "white",
          borderRadius: "12px",
          border: "none",
          fontWeight: 600,
          cursor: isLoading || !text.trim() ? "not-allowed" : "pointer",
          opacity: isLoading || !text.trim() ? 0.6 : 1,
          transition: "opacity 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FiSend size={18} />
      </button>
    </div>
  );
}
