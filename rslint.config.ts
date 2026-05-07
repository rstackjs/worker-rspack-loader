import { defineConfig, js, ts } from '@rslint/core';

export default defineConfig([
  js.configs.recommended,
  ts.configs.recommended,
  {
    files: ['setupTest.js', 'test/**/*.js'],
    rules: {
      'no-undef': 'off',
    },
  },
]);
