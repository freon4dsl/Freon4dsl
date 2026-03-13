import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [sveltekit(), tailwindcss()],
    build: {
        // Flowbite-Svelte currently imports some helpers from Svelte's internal runtime.
        // With Vite/Rollup chunk splitting this can produce warnings like:
        // "circular dependency between chunks ... svelte/src/internal/client/runtime.js".
        // These originate in upstream libraries (Svelte / Flowbite-Svelte), not in our code.
        //
        // We filter them here to keep the build output readable.
        //
        // TODO: Occasionally remove this filter and run a build again.
        // If newer versions of Svelte / Flowbite-Svelte fix the issue, this workaround
        // should be removed so genuine warnings remain visible.
        rollupOptions: {
            onLog(level, log, handler) {
                if (typeof log.message === "string" && log.message.includes("circular dependency between chunks")) {
                    return
                }
                handler(level, log)
            },
        },
        // This is a library build. Large chunks are not currently a problem for us,
        // so we allow a higher warning threshold than Vite's default 500 kB.
        // TODO: Revisit this occasionally if the library grows a lot further.
        chunkSizeWarningLimit: 1500,
    },
})
