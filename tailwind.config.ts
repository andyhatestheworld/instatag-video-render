import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand accents (fixed across themes)
        brand: {
          DEFAULT: "#0095F6",
          deep: "#0064E0",
        },
        success: "#22C55E",
        danger: "#ED4956",
        // Themeable surfaces / text (driven by CSS variables, see globals.css)
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        ink: "var(--ink)",
        sub: "var(--sub)",
        muted: "var(--muted)",
        line: "var(--line)",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "22px",
        xl: "28px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
