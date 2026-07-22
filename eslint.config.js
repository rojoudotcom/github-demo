// ESLint v9 flat config. Kept dependency-light: no shared config packages, just
// two file groups with the globals each needs so `no-undef` is meaningful.

export default [
  {
    // Browser app code.
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
    },
  },
  {
    // Node-side code: server, tests, config.
    files: ['scripts/**/*.mjs', 'test/**/*.js', '*.config.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        URL: 'readonly',
        globalThis: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'error',
    },
  },
];
