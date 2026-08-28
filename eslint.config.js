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
  // A flat-config object only acts as a true *global* ignore when `ignores`
  // is its sole key — bundled with `linterOptions` (below) it silently
  // stopped being global, which is how a stale local build (dist/, dist-e2e/)
  // ended up getting linted as if it were source. Keep this object
  // ignores-only.
  {
    ignores: [
      'node_modules',
      'dist',
      'dist-e2e',
      'build',
      '.husky',
      '*.min.js',
      'src/mocks/browser-worker/**',
      // Generated MSW service worker.
      'public/mockServiceWorker.js',
      // Playwright's own run output (see .gitignore).
      'test-results',
      'playwright-report',
      'blob-report',
      '.playwright',
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
  {
    // Bypassing a rule inline is itself a policy violation. Change the central config
    // with a documented rationale instead of weakening enforcement at the call site.
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: 'error',
    },
  },

  // Base JS + TS (type-checked) sets. `strictTypeChecked` (not `recommendedTypeChecked`)
  // is the strongest maintained preset typescript-eslint ships — see AGENTS.md §
  // The Quality Gate for the audit that confirmed this repo is clean against it.
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,

  // Maintained "recommended" flat config (not the newer, still-experimental
  // "recommended-latest" React Compiler rule set) — replaces hand-maintained
  // react-hooks rules so new rules the plugin adds are picked up automatically.
  reactHooks.configs.flat.recommended,

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
      // Start from maintained React and Hooks presets, then apply repository-specific
      // strictness/compatibility overrides below. This avoids hand-maintaining rule lists.
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.flat.recommended.rules,

      // ---- React best practices ----
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'error',
      'react/no-unescaped-entities': 'error',
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
      // Vercel react-best-practices `rendering-conditional-render`: `cond && <Jsx/>` can
      // leak a rendered "0"/NaN when `cond` isn't already boolean. Autofixable to a
      // ternary. See docs/vercel-react-best-practices-classification.md.
      'react/jsx-no-leaked-render': 'error',

      // ---- Hooks ----
      // The maintained preset owns the rule set; dependency correctness is promoted
      // from its warning default to a blocking error for this boilerplate.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

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
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      // Boilerplate must be a clean example of its own rules: no escape hatches.
      '@typescript-eslint/no-non-null-assertion': 'error',
      // Default options allow `@ts-expect-error` with a description; AGENTS.md bans
      // it unconditionally (§ Never Do), so require every variant to be banned —
      // this makes ESLint a strict superset of guard-rails.mjs's old regex check,
      // which is why that check was removed (see guard-rails.mjs's own comment).
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': true, 'ts-ignore': true, 'ts-nocheck': true, 'ts-check': false },
      ],
      // React Router's documented 404 pattern is `throw new Response(...)` from a
      // loader (isRouteErrorResponse checks for that exact shape, not `instanceof Error`).
      '@typescript-eslint/only-throw-error': ['error', { allow: [{ from: 'lib', name: 'Response' }] }],
      // strictTypeChecked's default bans every non-string type in a template
      // expression, including numbers — but `${count}` always stringifies to a
      // sensible, unambiguous value (unlike objects/any/nullish, which stay banned).
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],

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

  // Fast-refresh correctness is only meaningful for component modules.
  {
    files: ['src/components/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
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

  // Test files: the hardcoded-text rule exists to keep *shipped* UI copy out of
  // i18n's reach, not to force test fixtures/assertions (button labels, typed
  // values, expected strings) through translation keys.
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      'react/jsx-no-literals': 'off',
    },
  },

  // Playwright e2e specs/fixtures: not React code (no JSX, no hooks) — but
  // Playwright's own fixture API takes a callback parameter literally named
  // `use`, which react-hooks/rules-of-hooks pattern-matches as if it were
  // React's use() and flags as misplaced. False positive specific to this
  // naming collision, not a real violation.
  {
    files: ['e2e/**/*.ts', 'playwright.config.ts'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
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
