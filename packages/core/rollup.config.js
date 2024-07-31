import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' with { type: 'json'};
import dts from 'rollup-plugin-dts';

const production = false;

const config = [
	{
		input: 'src/index.ts',
		output: [
			{
				sourcemap: true,
				format: 'es',
				name: pkg.name,
				file: pkg.module,
			},
			{
				sourcemap: true,
				format: 'umd',
				name: pkg.name,
				file: pkg.main,
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
			typescript(),

			// If we're building for production (npm run build
			// instead of npm run dev), minify
			production && terser()
		]
	},
	{
		// create a bundled version of the types for use in the sveltekit packages
		input: "./dist/dts/index.d.ts",
		output: [{ file: 'dist/index.d.ts', format: 'es' }],
		plugins: [dts()],
	},
]

export default config;
