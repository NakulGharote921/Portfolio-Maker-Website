import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        browser: true,
        console: true,
        window: true,
        document: true,
        localStorage: true,
        sessionStorage: true,
        navigator: true,
        performance: true,
        fetch: true,
        AbortController: true,
        AbortSignal: true,
        File: true,
        FileList: true,
        FileReader: true,
        Blob: true,
        FormData: true,
        URL: true,
        URLSearchParams: true,
        Headers: true,
        TextEncoder: true,
        TextDecoder: true,
        crypto: true,
        btoa: true,
        atob: true,
        setTimeout: true,
        clearTimeout: true,
        setInterval: true,
        clearInterval: true,
        React: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslintPlugin,
      'react-refresh': reactRefreshPlugin,
    },
    rules: {
      ...tseslintPlugin.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'warn',
      'no-console': 'warn',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
