/* Lint the hand-written source, not the generated mode data, vendored three.js or assets. */
import globals from 'globals';

const shared = {
  'no-undef': 'error',
  'no-redeclare': 'error',
  'no-dupe-keys': 'error',
  'no-dupe-args': 'error',
  'no-unreachable': 'error',
  'no-cond-assign': ['error', 'except-parens'],
  'no-func-assign': 'error',
  'valid-typeof': 'error',
  'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
};

export default [
  { ignores: ['node_modules/**', 'js/vendor/**', 'data/**', 'assets/**', 'docs/**'] },
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        CM: 'writable', CM_DATA: 'readonly', Stockfish: 'readonly',
        /* classic-script globals from data/videos.js and the legacy bundle */
        VIDEOS: 'readonly', modeFor: 'readonly', modeName: 'readonly', explainOf: 'readonly', render: 'writable',
        /* guarded CommonJS export in the time-travel game */
        module: 'readonly',
      },
    },
    rules: shared,
  },
  {
    /* The ported 8x8 library is a set of classic scripts sharing one top-level scope (see js/app.js BUNDLES.legacy),
       so names deliberately cross file boundaries; no-undef cannot see that scope. */
    files: ['js/legacy/**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: { ...globals.browser, CM: 'writable', LEG: 'writable' } },
    rules: { ...shared, 'no-undef': 'off', 'no-redeclare': 'off' },
  },
  {
    files: ['qa/**/*.mjs', 'test/**/*.mjs', 'tools/**/*.mjs'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: { ...globals.node } },
    rules: shared,
  },
];
