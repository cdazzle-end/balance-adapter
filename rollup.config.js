import typescript from 'rollup-plugin-typescript2'
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import path from 'path';

let isMjsOutput = false; // Flag to track if we're generating .mjs output
function addJsExtension(isMjsOutput) {
  return {
    name: 'add-js-extension',
    resolveId(source, importer) {
      // Check if the output format is 'es' (for .mjs)
        if (isMjsOutput && source.startsWith('@acala-network/sdk/')) {
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
    // { find: '@acala-network/sdk/wallet', replacement: '@acala-network/sdk/wallet.js' },
    { find: '@acala-network/sdk/utils/storage', replacement: '@acala-network/sdk/utils/storage.js' }
  ]
});
// Handle mjs and cjs differently so we can add the proper file extensiosn to the mjs imports
export default [
  // cjs
  {
    input: './src/index.ts',
    output: {
      file: './dist/index.cjs',
      format: 'cjs',
    },
    plugins: [
      json(),
      typescript(),
      babel({
        plugins: ['@babel/plugin-syntax-import-assertions'],
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env'],
        extensions: ['.js', '.ts'],
      }),
    ]
  },
  // mjs
  {
    input: './src/index.ts', // Your main TypeScript file
    output: [
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
      addJsExtension(true),
    ],
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];
