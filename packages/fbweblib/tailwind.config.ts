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
