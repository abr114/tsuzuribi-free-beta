import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f8f3e9",
        "paper-soft": "#fffaf2",
        "paper-line": "#e4d6c4",
        ink: "#2e2923",
        "ink-muted": "#71675d",
        "deep-green": "#294837",
        sage: "#6f846e",
        "sage-soft": "#e2eadf",
        clay: "#b97a5f",
        "clay-soft": "#f5dfd1",
        "mist-blue": "#e1e9ea",
        "warm-gray": "#eee8dd",
      },
      boxShadow: {
        paper: "0 22px 55px rgba(58, 48, 36, 0.12)",
        soft: "0 14px 32px rgba(58, 48, 36, 0.08)",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
