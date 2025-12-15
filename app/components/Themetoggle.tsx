import { FiSun, FiMoon } from "react-icons/fi";

// Ultra-polished futuristic theme toggle

type Theme = "dark" | "light";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === "dark";

  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="relative h-11 w-20 rounded-full p-1 transition-all duration-500"
    >
      {/* Outer Glow */}
      <div
        className={`absolute inset-0 rounded-full blur-md transition-opacity duration-500
          ${
            isDark
              ? "bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 opacity-70"
              : "bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 opacity-70"
          }
        `}
      />

      {/* Track */}
      <div
        className={`relative h-full w-full rounded-full flex items-center transition-colors duration-500
          ${
            isDark
              ? "bg-slate-900/80 border border-white/10"
              : "bg-white/80 border border-gray-300"
          }
        `}
      >
        {/* Knob */}
        <div
          className={`
            absolute flex h-9 w-9 items-center justify-center rounded-full shadow-xl transition-all duration-500
            ${
              isDark
                ? "translate-x-9 bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-indigo-500/50"
                : "translate-x-0 bg-gradient-to-br from-yellow-300 to-orange-400 text-orange-900 shadow-yellow-400/50"
            }
          `}
        >
          {isDark ? (
            <FiSun className="h-4 w-4 animate-[spin_8s_linear_infinite]" />
          ) : (
            <FiMoon className="h-4 w-4" />
          )}
        </div>

        {/* Ambient Icons */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 text-xs opacity-40">
          <span className={isDark ? "opacity-30" : "opacity-80"}>☀</span>
          <span className={isDark ? "opacity-80" : "opacity-30"}>☾</span>
        </div>
      </div>
    </button>
  );
}
