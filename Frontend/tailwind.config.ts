import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        offbeat: {
          dark: "#0B0D0E",
          surface: "#15191B",
          elevated: "#202528",
          border: "#262C30",
          "border-subtle": "#1B2023",
          primary: "#F5F2EA",
          secondary: "#A9AFB1",
          muted: "#757D82",
          accent: {
            DEFAULT: "#E5A93C",
            hover: "#F3B952",
            subtle: "rgba(229, 169, 60, 0.12)",
          },
        },
        confidence: {
          verified: "#10B981",
          supported: "#F59E0B",
          new: "#94A3B8",
          flagged: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "-apple-system", "sans-serif"],
        display: ["'Outfit'", "'Plus Jakarta Sans'", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
        "card-hover": "0 10px 30px -5px rgba(0, 0, 0, 0.7)",
        elevated: "0 12px 40px -4px rgba(0, 0, 0, 0.6)",
        glow: "0 0 24px -4px rgba(229, 169, 60, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
