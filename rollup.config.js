import typescript from 'rollup-plugin-typescript2'
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
  {
    input: './src/index.ts', // Your main TypeScript file
    output: [
        { file: './dist/index.cjs', format: 'cjs' },
        { file: './dist/index.mjs', format: 'es' }
      ],
    plugins: [
      json(),
      typescript(), // Compile TypeScript files
      babel({
        plugins: ['@babel/plugin-syntax-import-assertions'],
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env'],
        extensions: ['.js', '.ts'],
      }),
      nodeResolve({
        extensions: ['.js', '.ts'] // Add any other extensions you're using
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];
