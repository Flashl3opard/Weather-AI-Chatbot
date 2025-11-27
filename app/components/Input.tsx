"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { FiSend } from "react-icons/fi";
import { FaSun, FaMoon } from "react-icons/fa";

type Theme = "light" | "dark";
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme") as Theme;
      if (storedTheme) return storedTheme;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light-mode", "dark-mode");
    root.classList.add(theme === "dark" ? "dark-mode" : "light-mode");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const setCssVariables = () => {
    return {
      "--bg-main": "var(--bg-primary)",
      "--bg-input": "var(--bg-input)",
      "--border-input": "var(--border-input)",
      "--color-text-chat": "var(--color-text)",
      "--color-text-secondary": "var(--color-subtext)",
      "--color-primary": "var(--color-bubble-user)",
      "--bg-bot-message-demo": "var(--bg-bubble-bot)",
      "--bg-user-message-demo": "var(--color-bubble-user)",
      "--color-user-text-demo": "var(--color-bubble-user-text)",
    } as React.CSSProperties;
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div style={setCssVariables()}>{children}</div>
    </ThemeContext.Provider>
  );
};

// ======================================================
// THEME TOGGLE BUTTON
// ======================================================

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "10px",
        borderRadius: "50%",
        border: "1px solid var(--border-input)",
        background: "var(--bg-header)",
        color: "var(--color-text)",
        cursor: "pointer",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {theme === "light" ? <FaMoon size={18} /> : <FaSun size={18} />}
    </button>
  );
};

// ======================================================
// CHAT INPUT COMPONENT
// ======================================================

interface ChatInputProps {
  onSend: (msg: string) => void;
  isLoading: boolean;
  placeholder: string;
  sendLabel: string;
}

export function ChatInput({ onSend, isLoading, placeholder }: ChatInputProps) {
  const [text, setText] = useState("");

  function handleSend() {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText("");
  }

  const isDisabled = isLoading || !text.trim();

  return (
    <div
      style={{
        padding: "12px 16px",
        borderTop: "1px solid var(--border-input)",
        background: "var(--bg-header)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder={placeholder}
        style={{
          flexGrow: 1,
          padding: "10px 14px",
          fontSize: "15px",
          borderRadius: "12px",
          border: "1px solid var(--border-input)",
          background: "var(--bg-primary)",
          color: "var(--color-text-chat)",
          outline: "none",
          minWidth: 0,
        }}
      />

      <button
        onClick={handleSend}
        disabled={isDisabled}
        style={{
          padding: "10px 14px",
          background: "var(--color-send-button, #10B981)",
          color: "white",
          borderRadius: "12px",
          border: "none",
          fontWeight: 600,
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.6 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <FiSend size={18} />
      </button>
    </div>
  );
}

// ======================================================
// MAIN CHAT APP (WITH LOADING ANIMATION)
// ======================================================

export default function ChatAppContainer() {
  const [messages, setMessages] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = (msg: string) => {
    setIsThinking(true);
    setMessages((prev) => [...prev, `You: ${msg}`]);

    setTimeout(() => {
      setMessages((prev) => [...prev, `AI: Responding to "${msg}"...`]);
      setIsThinking(false);
    }, 1500);
  };

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
  }, []);

  return (
    <ThemeProvider>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "var(--bg-main)",
          color: "var(--color-text-chat)",
          paddingTop: "60px",
        }}
      >
        <ThemeToggle />

        <div style={{ padding: "16px", flexGrow: 1, overflowY: "auto" }}>
          {messages.length === 0 ? (
            // ---------------------------------------
            // ✨ NEW — Animated Loader
            // ---------------------------------------
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                marginTop: "40px",
              }}
            >
              <div style={{ display: "flex", gap: "6px" }}>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>

              <style>{`
                .dot {
                  width: 10px;
                  height: 10px;
                  border-radius: 50%;
                  background: var(--color-text-secondary);
                  display: inline-block;
                  animation: pulse 1.4s infinite ease-in-out;
                }
                .dot:nth-child(2) {
                  animation-delay: 0.2s;
                }
                .dot:nth-child(3) {
                  animation-delay: 0.4s;
                }
                @keyframes pulse {
                  0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; }
                  40% { transform: scale(1); opacity: 1; }
                }
              `}</style>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "8px",
                  padding: "12px 16px",
                  borderRadius: "14px",
                  maxWidth: "75%",
                  wordBreak: "break-word",
                  background: msg.startsWith("You:")
                    ? "var(--bg-user-message-demo)"
                    : "var(--bg-bot-message-demo)",
                  color: msg.startsWith("You:")
                    ? "var(--color-user-text-demo)"
                    : "var(--color-text-chat)",
                  marginLeft: msg.startsWith("You:") ? "auto" : "0",
                  border: msg.startsWith("AI:")
                    ? "1px solid var(--border-bubble-bot, #e5e7eb)"
                    : "none",
                }}
              >
                {msg}
              </div>
            ))
          )}
        </div>

        <ChatInput
          onSend={handleSend}
          isLoading={isThinking}
          placeholder="Type your message..."
          sendLabel="Send"
        />
      </div>
    </ThemeProvider>
  );
}
