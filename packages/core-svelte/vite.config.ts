import { defineConfig } from 'vite';
// @ts-expect-error Cannot find module @sveltejs/kit/vite
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			external: [ // Add all dependencies from package.json here, so they remain external to the bundle.
				'@freon4dsl/core',
				'@material/web',
				'@material/slider',
				'@material/switch'
			]
		}
	}
});

