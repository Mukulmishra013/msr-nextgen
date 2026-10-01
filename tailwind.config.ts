import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "360px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      tv: "1920px",
      "tv-4k": "2560px",
    },
    extend: {
      colors: {
        brand: {
          50: "#f0fdf9",
          100: "#d7f7ee",
          200: "#b0eee0",
          300: "#76dfc9",
          400: "#3ec5ad",
          500: "#18a58f",
          600: "#0f6e56", // Brand primary deep teal
          700: "#0d5c48",
          800: "#0c493b",
          900: "#0a3d31",
          950: "#03231c",
          primary: "#0f6e56",
          dark: "#0a3d31",
          light: "#eaf6f2",
        },
        surface: {
          50: "#fcfdfd",
          100: "#f8faf9",
          200: "#f1f5f3",
          300: "#e5ece8",
        },
      },
      maxWidth: {
        "tv-container": "1440px",
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.9" },
        },
        "chat-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-subtle": "pulse-subtle 3s ease-in-out infinite",
        "chat-in": "chat-in 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
