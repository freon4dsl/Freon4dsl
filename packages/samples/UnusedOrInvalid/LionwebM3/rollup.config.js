import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' with { type: 'json'};

const config = [
    {
        input: 'src/index.ts',
        output: {
            sourcemap: true,
            format: 'es',
            name: pkg.name,
            file: pkg.module,
            globals: {
                'kotlin': 'kotlin',
                'core': '@freon4dsl/core'
                }
            },
        plugins: [typescript()]
    }
];

export default config;
