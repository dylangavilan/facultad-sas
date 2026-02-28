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
      },
    },
  },
  plugins: [],
};

export default config;
