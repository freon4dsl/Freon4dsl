// rollup.config.js (for ESM only)
import { nodeResolve } from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import pkg from './package.json' with { type: 'json' };

const external = [
    '@freon4dsl/core',
    'net.akehurst.language-agl-processor',
    'net.akehurst.language-agl-processor/net.akehurst.language-agl-processor.mjs',
    'mobx'
];

export default [
    // 1) Create JS bundle (no TS typechecking here)
    {
        input: 'src/index.ts',
        external,
        output: [
            { file: pkg.module, format: 'es', sourcemap: true },
        ],
        plugins: [
            nodeResolve({ preserveSymlinks: true }),
            esbuild({
                target: 'es2021',
                tsconfig: 'tsconfig.json'
            })
        ]
    },

    // 2) Create Types bundle
    {
        input: 'dist/types/index.d.ts',
        output: { file: pkg.types, format: 'es' },
        plugins: [dts()]
    }
];
