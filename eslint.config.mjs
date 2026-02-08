import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  // -------------------------------------------------------
  // Global ignores
  // -------------------------------------------------------
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/*.js',
      '**/*.mjs',
      '**/*.cjs',
    ],
  },

  // -------------------------------------------------------
  // Base: ESLint recommended + TypeScript strict
  // -------------------------------------------------------
  eslint.configs.recommended,
  ...tseslint.configs.strict,

  // -------------------------------------------------------
  // Shared TypeScript overrides for every package
  // -------------------------------------------------------
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Warn on unused vars but allow underscore-prefixed ones
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Enforce consistent return types
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // Allow empty functions (common in Express middleware stubs)
      '@typescript-eslint/no-empty-function': 'warn',

      // Relax the strict "no-extraneous-class" rule -- some Express patterns use classes
      '@typescript-eslint/no-extraneous-class': 'off',

      // Allow namespaces -- needed for Express type augmentation (declare global { namespace Express })
      '@typescript-eslint/no-namespace': 'off',

      // Downgrade no-explicit-any to warn for gradual adoption.
      // The codebase has existing usages; these should be fixed over time.
      '@typescript-eslint/no-explicit-any': 'warn',

      // Downgrade non-null assertions to warn for gradual adoption.
      // Controllers use req.user! patterns that should be refactored to type guards.
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Consistent returns -- use the base ESLint rule (no type info required)
      'consistent-return': 'warn',
    },
  },

  // -------------------------------------------------------
  // Test files -- relax strict rules further
  // -------------------------------------------------------
  {
    files: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // -------------------------------------------------------
  // React-specific rules (apps/web only)
  // -------------------------------------------------------
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  // -------------------------------------------------------
  // Prettier compat -- MUST be last to disable conflicting rules
  // -------------------------------------------------------
  eslintConfigPrettier,
);
