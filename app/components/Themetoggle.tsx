// components/ThemeToggle.tsx
import { FiSun, FiMoon } from "react-icons/fi";

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
      className={`rounded-full p-2 text-xl shadow-md transition-colors duration-300 ease-in-out 
        ${
          isDark
            ? "bg-slate-800/80 text-yellow-300 hover:bg-slate-700/80 border border-white/20"
            : "bg-gray-200/80 text-indigo-600 hover:bg-gray-300/80 border border-gray-300"
        }
      `}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? <FiSun /> : <FiMoon />}
    </button>
  );
}
