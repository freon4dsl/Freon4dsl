import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  // NB tailwindcss() is present here to include the (tailwind-based) styling used in any
  // custom components. When there are no custom component, it can be removed.
  plugins: [svelte(), tailwindcss()],
});
