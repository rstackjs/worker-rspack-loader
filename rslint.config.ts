import { defineConfig, globals, js, ts } from '@rslint/core';

export default defineConfig([
  js.configs.recommended,
  ts.configs.recommended,
  {
    files: ['globalSetupTest.js', 'setupTest.js', 'test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-useless-assignment': 'off',
    },
  },
  {
    files: ['src/**/*.js'],
    languageOptions: {
      globals: {
        Buffer: 'readonly',
        require: 'readonly',
      },
    },
  },
  {
    files: ['test/fixtures/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.worker,
      },
    },
  },
  {
    files: ['src/cjs.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['src/runtime/inline.js'],
    rules: {
      'preserve-caught-error': 'off',
    },
  },
]);
