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
                'agl': 'net.akehurst.language-agl-processor',
            }
        },
        plugins: [typescript()],
        external: ['@freon4dsl/core', 'net.akehurst.language-agl-processor']
    }
];

export default config;
