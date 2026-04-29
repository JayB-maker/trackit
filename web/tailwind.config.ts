import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surface tokens
        bg:           "var(--bg)",
        "bg-subtle":  "var(--bg-subtle)",
        surface:      "var(--surface)",
        // Border tokens
        border:       "var(--border)",
        "border-gold":"var(--border-gold)",
        // Text tokens
        text:         "var(--text)",
        muted:        "var(--text-muted)",
        faint:        "var(--text-faint)",
        // Gold tokens
        gold:         "var(--gold)",
        "gold-dim":   "var(--gold-dim)",
        "gold-bg":    "var(--gold-bg)",
        // Danger tokens
        danger:       "var(--danger)",
        "danger-bg":  "var(--danger-bg)",
        // Chart tokens
        "chart-1":    "var(--chart-1)",
        "chart-2":    "var(--chart-2)",
        "chart-3":    "var(--chart-3)",
      },
      fontFamily: {
        display: ["Georgia", "'Times New Roman'", "serif"],
        sans:    ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        btn:  "100px",
      },
    },
  },
  plugins: [],
};

export default config;
