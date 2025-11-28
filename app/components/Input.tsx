"use client";

import React, { useState, useRef, useEffect, LegacyRef } from "react";
import { FiSend } from "react-icons/fi";

// Define the expected type for the voice input component
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Global shortcut: Alt + A to toggle voice
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
      className="
        flex items-center gap-2 p-3 
        md:gap-3 md:p-4 
        bg-[var(--bg-input)] 
        border-t border-[var(--border-input)]
        transition-colors duration-300
      "
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
        className="
          flex-1 p-3 rounded-xl 
          border border-[var(--border-input)] 
          bg-[var(--bg-primary)] 
          text-[var(--color-text)] 
          placeholder-[var(--color-subtext)]
          focus:outline-none focus:ring-2 focus:ring-[var(--color-bubble-user)]/50
          transition-all duration-200
        "
      />

      {/* Voice Input Component */}
      <div className="flex-shrink-0">{renderVoiceWithRef()}</div>

      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className={`
          flex items-center justify-center gap-2 
          p-3 rounded-xl font-semibold text-sm
          bg-[var(--color-send-button)] text-white
          transition-all duration-200
          ${
            !input.trim() || isLoading
              ? "opacity-50 cursor-not-allowed"
              : "hover:brightness-110 active:scale-95"
          }
        `}
      >
        <FiSend size={18} />
        {/* Hide text on mobile, show on small screens and up */}
        <span className="hidden sm:inline">{sendLabel}</span>
      </button>
    </form>
  );
}
