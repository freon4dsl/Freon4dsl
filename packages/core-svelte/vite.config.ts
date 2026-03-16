import { defineConfig } from 'vite';
// @ts-expect-error Cannot find module @sveltejs/kit/vite
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
    plugins: [sveltekit()],
    build: {
        rollupOptions: {
            external: [
                // Keep Svelte runtime external.
                // If Rollup bundles parts of the Svelte runtime it may split them
                // into separate chunks, which can cause circular dependency warnings
                // and incorrect execution order during build.
                'svelte',
                'svelte/store',
                'svelte/transition',
                'svelte/animate',
                'svelte/easing',
                'svelte/motion',

                // External project dependencies (provided by the consuming app)
                '@freon4dsl/core'
            ]
        }
    }
});

