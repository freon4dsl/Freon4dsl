import { defineConfig } from 'vite';
// @ts-expect-error Cannot find module @sveltejs/kit/vite
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	build: {
		rollupOptions: {
			external: [ // Add all dependencies from package.json here, so they remain external to the bundle.
				'mobx',
				'@lionweb/repository-client',
				'@lionweb/validation',
				'reflect-metadata',
				'lodash',
				'tslib'
			]
		},
	},
	plugins: [sveltekit()]
});

