import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
// import css from 'rollup-plugin-css-only';
import pkg from './package.json';
import autoExternal from 'rollup-plugin-auto-external';

// const production = !process.env.ROLLUP_WATCH;
const production = false;
const name = pkg.name
	.replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
	.replace(/^\w/, m => m.toUpperCase())
	.replace(/-\w/g, m => m[1].toUpperCase());

export default {
	input: 'src/index.ts',
	output: [
		{
			file: pkg.module,
			format: 'es',
			sourcemap: !production,
			globals: {
				'@projectit/core': '@projectit/core',
				'mobx': 'mobx'
			}
		},
		{
			file: pkg.main,
			format: 'umd',
			name,
			sourcemap: !production,
			globals: {
				'@projectit/core': '@projectit/core',
				'mobx': 'mobx'
			}
		}
	],
	plugins: [
		svelte({
			preprocess: sveltePreprocess({ sourceMap: !production }),
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
			,
			emitCss: false
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		// css({ output: 'core-svelte.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte', '@projectit/core']
		}),
		autoExternal(),
		commonjs(),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		}),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	]
};
