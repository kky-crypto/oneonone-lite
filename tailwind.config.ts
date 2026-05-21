import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        mint: {
          50: "#f0fdf9",
          100: "#ccfbef",
          200: "#99f6df",
          300: "#5ceacc",
          400: "#2dd4b3",
          500: "#14b89a",
          600: "#0d947d",
          700: "#0f7666",
          800: "#115e53",
          900: "#134e45",
        },
      },
    },
  },
  plugins: [],
};

export default config;
