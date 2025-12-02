import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter(),
  },
  compilerOptions: {
    // Disable all Svelte compiler warnings
    onwarn: () => {}
    // Disbale all warnings except your own components
    // onwarn(warning, handler) {
    //   if (warning.filename?.includes('node_modules')) return;
    //   handler(warning);
    // }
  }
};

export default config;
