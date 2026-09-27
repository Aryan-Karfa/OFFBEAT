import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        offbeat: {
          dark: "#0a0c10",
          surface: "#12161f",
          "surface-subtle": "#161c28",
          "surface-elevated": "#1c2333",
          border: "#1f2633",
          "border-hover": "#2d374d",
          accent: "#ff5a36",
          "accent-hover": "#ff704f",
          "accent-light": "rgba(255, 90, 54, 0.12)",
          gold: "#e5a93c",
          "gold-hover": "#f0b84f",
          muted: "#8892b0",
          text: "#f1f5f9",
          "text-muted": "#94a3b8",
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        "glow-accent": "0 0 20px -5px rgba(255, 90, 54, 0.35)",
        "glow-gold": "0 0 20px -5px rgba(229, 169, 60, 0.35)",
        "surface-card": "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
