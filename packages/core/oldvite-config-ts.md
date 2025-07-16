import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',  // The 'main' of the library
      formats: ['es'],        // The format to produce
      fileName: 'index',      // The name of the file to produce
    },
    rollupOptions: {
      external: [ // Add all dependencies from package.json here, so they remain external to the bundle.
        'mobx',
        '@lionweb/repository-client',
        '@lionweb/validation',
        'reflect-metadata',
        'lodash',
        'tslib'
      ]
    },
  },
  plugins: [dts()],
  esbuild: {
    target: 'esnext', // Keep in line with lib.formats!
    supported: {
      'top-level-await': true // To be able to use the await keyword outside an async function.
    },
  },
  optimizeDeps: { // The options in this section are only applied to the dependency optimizer, which is only used in dev.
    esbuildOptions: { // Options to pass to esbuild during the dep scanning and optimization.
      target: 'esnext' // Keep in line with lib.formats!
    }
  }
}); 
