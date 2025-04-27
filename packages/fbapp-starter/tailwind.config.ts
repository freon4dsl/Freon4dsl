import type { Config } from "tailwindcss";
import flowbitePlugin from "flowbite/plugin";

export default {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    // The following line is here to pick up any tailwind directives from the flowbite-webapp.
    // In hindsight, it would have been better to style the webapp similar to the core-svelte library.
    // For now, this remains a todo.
    "../../node_modules/@freon4dsl/flowbite-webapp/src/**/*.{html,js,svelte,ts}",
    "../../node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
  ],
  darkMode: "selector",
  theme: {
    extend: {
      colors: {
        // keep the following for pure black and white
        // 900: "#1F1F1F", /* Near-black, deep charcoal gray */
        // 800: "#2D2D2D", /* Very dark neutral gray */
        // 700: "#444444", /* Balanced deep gray */
        // 600: "#5A5A5A", /* Strong mid-gray */
        // 500: "#6F6F6F", /* Smooth neutral gray */
        // 400: "#878787", /* Lighter, airy neutral gray */
        // 300: "#A0A0A0", /* Soft, clean light gray */
        // 200: "#C0C0C0", /* Pale, elegant gray */
        // 100: "#E0E0E0", /* Near-white subtle gray */
        light: {
          base: {
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
          accent: {
            50: "#EEF7E4",  // Very light background color
            100: "#D6E9BA", // Light background color
            200: "#BFD98F", // Lighter surface color
            300: "#A8CA65", // Surface color
            400: "#98CA32", // Slightly darker surface color
            500: "#85B42C", // Main background color
            600: "#709A27", // Text color
            700: "#5B7F20", // Darker text color
            800: "#47651A", // Darker surface accent
            900: "#334C14", // Darkest background color
          },
          freon: {
            50: "#FFF9F5",
            100: "#FFE8D9",
            150: "#FFD0B3",
            200: "#FFB88D",
            250: "#FF9F66",
            300: "#FC7307",
            350: "#FC7307",
            400: "#DB6506",
            500: "#DB6506",
            600: "#B95805",
            700: "#974A04",
            800: "#753D03",
            900: "#532F02"
          },
          freonAccent: {
            error: "#FF4C4C",
            editable: "#FFE8D9",
            optional: "#FFB88D",
            border: "#47651A",
            dropdown: "#5B7F20",
            button: "#D6E9BA",
          }
        },
        dark: {
          base: {
            50: "#FEFEFA",
            100: "#EEF7E4",  // Very light background color
            150: "#D6E9BA", // Light background color
            200: "#C6E29F",
            250: "#BFD98F", // Lighter surface color
            300: "#A8CA65", // Surface color
            350: "#98CA32", // Slightly darker surface color
            400: "#85B42C", // Main background color
            500: "#709A27", // Text color
            600: "#5B7F20", // Darker text color
            700: "#47651A", // Darker surface accent
            800: "#334C14", // Darkest background color
            900: "#213409",
          },
          accent: {
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
          freon: {
            50: "#FEFEFA",
            100: "#EEF7E4",  // Very light background color
            150: "#D6E9BA", // Light background color
            200: "#C6E29F",
            250: "#BFD98F", // Lighter surface color
            300: "#A8CA65", // Surface color
            350: "#98CA32", // Slightly darker surface color
            400: "#85B42C", // Main background color
            500: "#709A27", // Text color
            600: "#5B7F20", // Darker text color
            700: "#47651A", // Darker surface accent
            800: "#334C14", // Darkest background color
            900: "#213409",
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
