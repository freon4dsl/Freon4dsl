import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' with { type: 'json'};

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
			// 	sourcemap: true
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
		],
		external
			: ['mobx', 'lodash', '@lionweb/repository-client', 'reflect-metadata']
	}
]

export default config;
