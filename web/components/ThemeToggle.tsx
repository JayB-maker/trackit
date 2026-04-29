"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ size = 32 }: { size?: number }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="flex items-center justify-center rounded-full border border-border bg-surface text-gold cursor-pointer transition-colors duration-200 hover:border-border-gold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.44 }}
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
