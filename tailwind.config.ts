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
        sans: ["var(--font-exo2)", "system-ui", "sans-serif"],
        serif: ["var(--font-exo2)", "system-ui", "serif"],
        mono: ["var(--font-exo2)", "ui-monospace", "monospace"],
        exo2: ["var(--font-exo2)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
