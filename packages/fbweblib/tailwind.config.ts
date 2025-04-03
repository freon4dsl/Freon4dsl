import type { Config } from "tailwindcss";
import flowbitePlugin from "flowbite/plugin";

export default {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "../../node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
  ],
  darkMode: "selector",
  theme: {
    extend: {
      colors: {
        // flowbite-svelte
        primary: {
          50: "#FFE8D9",
          100: "#FFD0B3",
          200: "#FFB88D",
          300: "#FF9F66",
          400: "#FC7307",
          500: "#DB6506",
          600: "#B95805",
          700: "#974A04",
          800: "#753D03",
          900: "#532F02",
        },
        secondary: {
          50: "#EEF7E4",
          100: "#D6E9BA",
          200: "#BFD98F",
          300: "#A8CA65",
          400: "#98CA32",
          500: "#85B42C",
          600: "#709A27",
          700: "#5B7F20",
          800: "#47651A",
          900: "#334C14",
        },
        freonGray: {
          50: "#EEF7E4",
          100: "#D6E9BA",
          200: "#BFD98F",
          300: "#A8CA65",
          400: "#98CA32",
          500: "#85B42C",
          600: "#709A27",
          700: "#5B7F20",
          800: "#47651A",
          900: "#334C14",
          //   100: "#E0E0E0", /* Near-white subtle gray */
          //   200: "#C0C0C0", /* Pale, elegant gray */
          //   300: "#A0A0A0", /* Soft, clean light gray */
          //   400: "#878787", /* Lighter, airy neutral gray */
          //   500: "#6F6F6F", /* Smooth neutral gray */
          //   600: "#5A5A5A", /* Strong mid-gray */
          //   700: "#444444", /* Balanced deep gray */
          //   800: "#2D2D2D", /* Very dark neutral gray */
          //   900: "#1F1F1F", /* Near-black, deep charcoal gray */
        },
        freonWhite: {
          100: "#FFE8D9",
          200: "#FFD0B3",
          300: "#FFB88D",
          400: "#FF9F66",
          500: "#FC7307",
          // 100: "#FFFFFF", /* Pure White */
          // 200: "#F4F4F4", /* Light Smoke */
          // 300: "#FFFAF0", /* Floral White */
          // 400: "#FFFFE0", /* Light Yellow */
          // 500: "#FAEBD7", /* Antique White */
        },
        freonAccent: {
          error: "#FF4C4C",
          editable: "#FFD0B3",
          optional: "#DB6506",
          border: "#47651A",
          dropdown: "#5B7F20",
          button: "#98CA32",
        }
      },
    },
  },
  screens: {
    'sm': '640px',
    // => @media (min-width: 640px) { ... }

    'md': '768px',
    // => @media (min-width: 768px) { ... }

    'lg': '1024px',
    // => @media (min-width: 1024px) { ... }

    'xl': '1280px',
    // => @media (min-width: 1280px) { ... }

    '2xl': '1536px',
    // => @media (min-width: 1536px) { ... }
  },
  plugins: [flowbitePlugin],
} as Config;
