"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiSend } from "react-icons/fi";
import { LegacyRef } from "react";

// Define the expected type for the voice input component, explicitly allowing a ref
type VoiceButtonRef = LegacyRef<HTMLButtonElement> | undefined;

interface ChatInputProps {
  onSend: (input: string) => void;
  isLoading: boolean;
  placeholder: string;
  sendLabel: string;
  voiceInput: React.ReactElement<{ ref?: VoiceButtonRef } & any>; // Updated type
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && (event.key === "a" || event.code === "KeyA")) {
        event.preventDefault();
        event.stopPropagation();

        if (voiceButtonRef.current) {
          voiceButtonRef.current.click();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const renderVoiceWithRef = () => {
    if (React.isValidElement(voiceInput)) {
      // FIX APPLIED: Using a type assertion to inform TypeScript that the element accepts a ref prop
      return React.cloneElement(
        voiceInput as React.ReactElement<{ ref: typeof voiceButtonRef }>,
        {
          ref: voiceButtonRef,
        }
      );
    }
    return voiceInput;
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: "16px 24px",
        background: "var(--bg-input)",
        borderTop: "1px solid var(--border-input)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
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
        style={{
          flexGrow: 1,
          padding: "12px 16px",
          borderRadius: "12px",
          border: "1px solid var(--border-input)",
          background: "var(--bg-main)",
          color: "var(--color-text-chat)",
          fontSize: "16px",
        }}
      />

      {renderVoiceWithRef()}

      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        style={{
          padding: "10px 16px",
          borderRadius: "12px",
          background: "var(--color-primary)",
          color: "white",
          border: "none",
          cursor: !input.trim() || isLoading ? "not-allowed" : "pointer",
          opacity: !input.trim() || isLoading ? 0.6 : 1,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "14px",
          fontWeight: 600,
          transition: "opacity 0.2s",
        }}
      >
        <FiSend size={18} />
        {sendLabel}
      </button>
    </form>
  );
}
