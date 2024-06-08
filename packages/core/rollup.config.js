import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' assert { type: 'json'};
import nodePolyfills from 'rollup-plugin-polyfill-node';
// import builtins from 'rollup-plugin-node-builtins';
// import globals from 'rollup-plugin-node-globals';

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
		},
		{
			file: pkg.main,
			format: 'umd',
			name,
			sourcemap: !production,
		}
	],
	plugins: [
		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs

		/* the param to resolve is added because of the note in
		https://github.com/rollup/plugins/tree/master/packages/node-resolve/#readme
		regarding "Resolving Built-Ins (like fs)"
		 */
		resolve({ preferBuiltins: false }),
		commonjs(),
		nodePolyfills(),
		// builtins(),
		// globals(),
		typescript({
			sourceMap: true, //  !production,
			inlineSources: !production,
			tsconfig: "./tsconfig.json",
			// Override outDir, since Rollup magically adds "dist"itself
			outDir: ".",
			declarationDir: "."
		}),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	]
};
