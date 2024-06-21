import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' assert { type: 'json'};
import dts from 'rollup-plugin-dts';

const config = [
	{
		input: 'src/index.ts',
		output: [
			{
				sourcemap: true,
				format: 'es',
				name: pkg.name,
				file: pkg.module,
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
			commonjs(),
			resolve({ preferBuiltins: false }),
			typescript(),

			// minify
			terser()
		]
	},
	{
		input: "./dist/dts/index.d.ts",
		output: [{ file: 'dist/index.d.ts', format: 'es' }],
		plugins: [dts()],
	},
]

export default config;
