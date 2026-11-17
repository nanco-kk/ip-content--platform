import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fdf5f1",
          100: "#fae8df",
          200: "#f4d1bf",
          300: "#edb39a",
          400: "#e0956e",
          500: "#c65d3a",
          600: "#a04a2c",
          700: "#7d3a22",
          800: "#5a2a19",
          900: "#3d1a10",
        },
        accent: {
          50: "#fbf7f0",
          100: "#f5ebd8",
          200: "#ebd7b1",
          300: "#d4a574",
          400: "#c4915c",
          500: "#a8703f",
          600: "#875634",
          700: "#664028",
          800: "#4a2e1c",
          900: "#2e1c10",
        },
        paper: {
          bg: "#faf6f0",
          card: "#fffdf8",
          dark: "#f5efe6",
        },
        ink: {
          dark: "#3d2e1f",
          base: "#5a4632",
          light: "#8b7355",
          muted: "#b3a288",
        },
        warm: {
          border: "#e0d5c6",
          divider: "#d4c5a9",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "Georgia", '"Times New Roman"', '"Songti SC"', "serif"],
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};

export default config;
