import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          DEFAULT: "#F97316",
          dark: "#ea6000",
          light: "#fff7ed",
        },
        indigo: {
          jh: "#1e1b4b",
          "jh-2": "#312e81",
        },
        cream: {
          DEFAULT: "#fffbf5",
          2: "#fef3e2",
        },
      },
      fontFamily: {
        baloo: ["var(--font-baloo)", "cursive"],
        hind: ["var(--font-hind)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
