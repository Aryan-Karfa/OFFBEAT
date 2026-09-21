import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        offbeat: {
          dark: "#0a0c10",
          surface: "#12161f",
          border: "#1f2633",
          accent: "#ff5a36",
          gold: "#e5a93c",
          muted: "#8892b0",
        },
      },
    },
  },
  plugins: [],
};

export default config;
