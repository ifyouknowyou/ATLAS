import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const filename = fileURLToPath(import.meta.url);
const dir = dirname(filename);
const compat = new FlatCompat({ baseDirectory: dir });

const eslintConfig = [
  {
    // Lint only the application source; ignore build artifacts.
    ignores: ['.next/**', 'out/**', 'next-env.d.ts', 'node_modules/**'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
];

export default eslintConfig;