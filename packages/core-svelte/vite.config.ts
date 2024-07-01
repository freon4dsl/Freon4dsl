import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: 'jsdom',
		setupFiles: ['./vitest-setup.js'],
		globals: true
	}
});
