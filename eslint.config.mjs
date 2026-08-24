import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import globals from 'globals';
import obsidianmd from 'eslint-plugin-obsidianmd';

export default [
  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'main.js',
      'coverage/**',
      '*.d.ts',
      '!src/**/*.d.ts',
      '*.config.js',
      '*.mjs',
      '!eslint.config.mjs',
    ],
  },

  // Base ESLint recommended config
  eslint.configs.recommended,

  // Obsidian plugin guidelines - the same rules the community directory scans against
  ...obsidianmd.configs.recommended,

  // TypeScript files
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        sourceType: 'module',
        // Type information is required by the floating-promise rules
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,

        // Obsidian globals
        createDiv: false,
        createEl: false,
        createSpan: false,
        createSvg: false,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Disable base rule as it can report incorrect errors
      'no-unused-vars': 'off',

      // TypeScript-specific rules. Matches the unused-variable settings the
      // community directory scan uses, hence the ^_ escape hatches
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-function': 'off',

      // Reports every sentence fragment as needing a capital, which misfires
      // on the notice text that is deliberately split across elements
      'obsidianmd/ui/sentence-case': 'off',

      // Flagged by the community directory scan
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // The no-unsafe-* family comes with the type-checked preset but is not
      // part of what the directory scans for. Obsidian's own API returns any
      // from loadData and similar, so these fire on correct code
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',

      // General rules
      'no-prototype-builtins': 'off',
    },
  },

  // Test files and mocks. The directory scan only looks at shipped source, and
  // the DOM shim deliberately does the things these rules exist to prevent
  {
    files: ['src/**/*.test.ts', 'src/__tests__/**/*.ts', 'src/__mocks__/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      // Mock implementations keep the real signatures, unused params included
      '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
      '@typescript-eslint/await-thenable': 'off',
      // The obsidian mock has to import the real moment to stand in for it
      '@typescript-eslint/no-restricted-imports': 'off',
      'import/no-extraneous-dependencies': 'off',
      'obsidianmd/no-global-this': 'off',
      'obsidianmd/no-static-styles-assignment': 'off',
      'obsidianmd/prefer-create-el': 'off',
      'obsidianmd/prefer-instanceof': 'off',
      'obsidianmd/prefer-window-timers': 'off',
    },
  },

  // This config file imports from devDependencies by definition
  {
    files: ['eslint.config.mjs'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
];
