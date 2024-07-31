import { defineConfig } from 'vite';

export default defineConfig({
//	root: 'src',
	resolve: {
		alias: [
			{
				find:/^(.*)\.js$/,
				replacement: '$1',
			}
		]
	}
});

