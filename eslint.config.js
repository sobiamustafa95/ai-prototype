import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

/**
 * Local plugin implementing Impeccable's "no arbitrary values" intent for Tailwind:
 * flags className arbitrary values like `text-[#abc123]`, `w-[127px]`, `gap-[17px]`.
 * Components must reference design tokens (see AGENTS.md § Styling), never raw values.
 */
const impeccable = {
  rules: {
    'no-arbitrary-tailwind-values': {
      meta: {
        type: 'problem',
        docs: { description: 'Disallow arbitrary Tailwind values; use design tokens instead.' },
        schema: [],
        messages: {
          arbitrary:
            'Arbitrary Tailwind value "{{ value }}" is not allowed. Use a design token from src/index.css (@theme).',
        },
      },
      create(context) {
        const ARBITRARY = /(^|[\s:])[\w-]+-\[[^\]]+\]/;
        function check(node, raw) {
          if (typeof raw === 'string' && ARBITRARY.test(raw)) {
            context.report({ node, messageId: 'arbitrary', data: { value: raw.trim() } });
          }
        }
        return {
          JSXAttribute(node) {
            if (node.name.name !== 'className') return;
            const value = node.value;
            if (!value) return;
            if (value.type === 'Literal') check(value, value.value);
            if (value.type === 'JSXExpressionContainer' && value.expression.type === 'Literal') {
              check(value.expression, value.expression.value);
            }
          },
        };
      },
    },
  },
};

export default tseslint.config(
  {
    ignores: [
      'node_modules',
      'dist',
      'build',
      '.husky',
      '*.min.js',
      'src/mocks/browser-worker/**',
      // Generated MSW service worker.
      'public/mockServiceWorker.js',
      // Vendored agent-skill installs (`npx impeccable install`) — gitignored, not
      // boilerplate source; see .gitignore for the full list.
      '.claude/skills/impeccable/**',
      '.cursor/skills/**',
      '.cursor/agents/**',
      '.github/skills/**',
      '.github/agents/**',
      '.github/hooks/**',
    ],
  },

  // Base JS + TS (type-checked) recommended sets.
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      'react-refresh': reactRefresh,
      impeccable,
    },
    rules: {
      // ---- React best practices (FE_QUALITY_GATE_SETUP.md Phase 2) ----
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react/jsx-key': 'error',
      'react/jsx-no-comment-textnodes': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/require-render-return': 'error',
      'react/self-closing-comp': 'error',
      'react/button-has-type': 'error',
      'react/no-array-index-key': 'error',

      // ---- Hooks ----
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ---- Accessibility (WCAG 2.1 AA gate) ----
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-props': 'error',

      // ---- TypeScript strictness ----
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      // Boilerplate must be a clean example of its own rules: no escape hatches.
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      // React Router's documented 404 pattern is `throw new Response(...)` from a
      // loader (isRouteErrorResponse checks for that exact shape, not `instanceof Error`).
      '@typescript-eslint/only-throw-error': ['error', { allow: [{ from: 'lib', name: 'Response' }] }],

      // ---- Guard rails ----
      'no-console': 'error',
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      // Named function expressions (e.g. forwardRef(function Input(){})) are allowed
      // because they give components a stable displayName.
      'prefer-arrow-callback': ['warn', { allowNamedFunctions: true }],
      'no-unused-vars': 'off',

      // ---- Impeccable (styling) ----
      'impeccable/no-arbitrary-tailwind-values': 'error',
    },
  },

  // Fast-refresh hint is only meaningful for component modules.
  {
    files: ['src/components/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // Ambient declaration files legitimately declare empty augmentation interfaces.
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
    },
  },

  // Hardcoded user-facing text is only enforced inside rendered components.
  {
    files: ['src/components/**/*.tsx'],
    rules: {
      'react/jsx-no-literals': [
        'error',
        {
          noStrings: true,
          ignoreProps: true,
          allowedStrings: ['·', '—', '/', '|'],
          noAttributeStrings: false,
        },
      ],
    },
  },

  // MSW mocks: relax a couple of rules that fight fixture ergonomics.
  {
    files: ['src/mocks/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'off',
      'react/jsx-no-literals': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },

  // Node-land config & scripts (not part of the app TS project → no type-checked rules).
  {
    files: ['**/*.{js,mjs,cjs}', 'scripts/**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off',
    },
  },

  prettier
);
