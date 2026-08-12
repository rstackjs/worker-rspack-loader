import { defineConfig, js, ts } from '@rslint/core';

export default defineConfig([
  js.configs.recommended,
  ts.configs.recommended,
  {
    files: ['globalSetupTest.js', 'setupTest.js', 'test/**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
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
