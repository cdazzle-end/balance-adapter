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
            id: source + '/index.js',
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

const external = [
  "@acala-network/api",
  "@acala-network/chopsticks",
  "@acala-network/eth-providers",
  "@acala-network/sdk",
  "@acala-network/sdk-core",
  "@acala-network/sdk-swap",
  "@acala-network/sdk-wallet",
  '@polkadot-assets/updater'
]
// Handle mjs and cjs differently so we can add the proper file extensiosn to the mjs imports
export default [
  // cjs
  {
    input: './src/index.ts',
    output: {
      file: './dist/index.cjs',
      format: 'cjs',
    },
    external: external,
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
    external: external,
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
