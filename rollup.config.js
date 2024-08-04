import typescript from 'rollup-plugin-typescript2'
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import path from 'path';

function addJsExtension() {
  return {
    name: 'add-js-extension',
    resolveId(source, importer) {
      if (source.startsWith('@acala-network/sdk/')) {
        return {
          id: source + '.js',
          external: true
        };
      }
      return null;
    }
  };
}
const customAliases = alias({
  entries: [
    { find: '@acala-network/sdk/wallet', replacement: '@acala-network/sdk/wallet.js' },
    { find: '@acala-network/sdk/utils/storage', replacement: '@acala-network/sdk/utils/storage.js' }
  ]
});
export default [
  {
    input: './src/index.ts', // Your main TypeScript file
    output: [
        { file: './dist/index.cjs', format: 'cjs' },
        { file: './dist/index.mjs', format: 'es' }
      ],
    plugins: [
      // customAliases,
      json(),
      typescript(), // Compile TypeScript files
      babel({
        plugins: ['@babel/plugin-syntax-import-assertions'],
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env'],
        extensions: ['.js', '.ts'],
      }),

      // Handling extension issues
      addJsExtension(),

      // nodeResolve({
      //   extensions: ['.js', '.ts'],
      //   preferBuiltins: true
      // }),
    ],
    // external: [
    //   /^@polkadot\//,
    //   /^@acala-network\//,
    //   'axios',
    //   'lodash',
    //   'ethers'
    // ]
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];
