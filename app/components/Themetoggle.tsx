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
      className={`p-2 rounded-full shadow-md transition-all duration-300 border 
        ${
          isDark
            ? "bg-slate-800/90 border-white/20 text-white hover:bg-slate-700/90"
            : "bg-gray-200/90 border-gray-300 text-gray-700 hover:bg-gray-300"
        }
      `}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <FiSun className="text-yellow-300" />
      ) : (
        <FiMoon className="text-gray-700" />
      )}
    </button>
  );
}
