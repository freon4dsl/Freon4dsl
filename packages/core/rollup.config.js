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
				file: pkg.main,
			}
			// Uncomment to generate commonjs, but did not manage to get this working ok
			// {
			// 	coiurcemap: true
			// 	file: 'dist/index.cjs',
			// 	format: 'cjs'
			//
			// }
		],
		plugins: [
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
