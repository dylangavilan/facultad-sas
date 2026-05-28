import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        notion: {
          border: "rgb(233, 233, 231)",
          bg: "rgb(251, 251, 250)",
          "text-primary": "rgb(55, 53, 47)",
          "text-secondary": "rgb(120, 119, 116)",
        },
        edu: {
          bgMuted: "var(--edu-bg-muted)",
          bgSurface: "var(--edu-bg-surface)",
          borderSubtle: "var(--edu-border-subtle)",
          primary: "#2563eb",
          primarySoft: "#dbeafe",
          success: "#16a34a",
          warning: "#f59e0b",
          danger: "#ef4444",
          info: "#0ea5e9",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 18px 45px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
