# AGENTS.md — Geeks FE Boilerplate

**This file is the single, canonical, tool-agnostic rulebook for this repository.**
Cursor reads it natively; `CLAUDE.md` imports it; `.cursor/rules/*.mdc` narrowly scope it.
Never copy these rules into tool-specific files — point at this file instead.
`docs/GUIDE.md` is the same rules as a friendlier, longer walkthrough.

This is a **domain-agnostic boilerplate**, the starting point for every Geeks project.
Two rules override everything else:

1. **Zero business-domain lock-in.** Never invent products, orders, bookings, etc. The only
   feature folders are `src/components/features/ExampleWidget` (a generic paginated/searchable
   list) and `src/components/features/Auth` (login/signup/forgot-password/verify/reset —
   the "day one" auth flow every real project needs) — both domain-agnostic on purpose.
2. **Maximum guardrails on _how_ code is written** — enforced by tooling, not discipline.

---

## Tech Stack

- **Build:** Vite (SPA, not SSR) · **Language:** TypeScript (strict)
- **UI:** React 18+ function components + hooks only (no class components)
- **UI primitives:** Radix UI + `class-variance-authority` (CVA), the shadcn/ui pattern —
  the base layer for **all** common components, not just complex ones. Add more via
  `npx shadcn add <component>` (see `components.json`), then re-point its classes at our
  own `@theme` tokens — never adopt shadcn's default `--primary`/`--secondary` CSS variables.
  `src/lib/utils.ts` exports the `cn()` class-merge helper every common component uses.
- **Routing:** React Router v7 data router (`createBrowserRouter`)
- **Styling:** Tailwind CSS v4 (CSS-first `@theme` tokens in `src/index.css`)
- **Client state:** Zustand (feature-scoped stores) · **Server state:** TanStack Query v5
- **Forms:** React Hook Form + Zod (`src/schemas/`; shared primitives in `common.schema.ts`)
- **HTTP:** Axios typed client with interceptors (`src/services/api-client.ts`)
- **Env validation:** Zod-validated `import.meta.env` (`src/constants/env.ts`) — fails loudly
  at startup on a missing/malformed env var instead of shipping a silent misconfiguration.
- **Testing:** none by design — no Vitest/RTL, no coverage, no Storybook. Verify a change by
  running it (`npm run dev`) and checking it against the feature/component it was meant to do.
- **API mocking:** MSW (dev only, fake API responses for the app to hit)
- **Lint/format:** ESLint (flat config) + Prettier · **Hooks:** Husky + lint-staged + commitlint

Do not substitute a stack choice without flagging it first.

---

## Directory Map

```
src/
  components/common/     Reusable, domain-agnostic UI: Button, Input, PasswordInput, Dialog,
                          ConfirmDialog, DropdownMenu, Toaster, ThemeToggle, LoadingState,
                          ErrorState, EmptyState, FormField, SearchInput, Pagination,
                          DataTable, Seo, Can (inline role gate)
  components/features/   Feature folders: ExampleWidget (generic list), Auth (login/signup/
                          forgot-password/verify-otp/reset-password) — copy either to start one
  components/layouts/    AppLayout, AuthLayout, ErrorLayout, DashboardLayout (sidebar+topbar)
  hooks/                 Generic hooks (useDebouncedValue, useThemeSync); feature hooks live
                          in their feature folder
  lib/                   utils.ts (cn() class-merge helper for CVA/Radix components)
  services/              api-client.ts, authService.ts (stub), queryClient.ts
  utils/                 Pure functions only (100% unit-testable)
  schemas/               Zod schemas (forms + API contracts); common.schema.ts for
                          shared primitives (email/password/phone/url)
  types/                 Shared TS interfaces (types MAY be barrel-exported)
  constants/             api-routes.ts, config.ts, env.ts (validated env)
  router/                router.tsx (createBrowserRouter), guards (RequireAuth, RequireRole),
                          DashboardRoute/ForbiddenRoute placeholders
  stores/                Zustand stores, one file per domain slice (authStore is
                          persist-backed; themeStore drives light/dark/system)
  mocks/                 MSW handlers + browser worker setup (dev-time fake API)
  i18n/                  i18next setup (index.ts) + locales/<lng>/common.json — the
                          only source of user-facing text, see § Data & State below
```

Where things go — quick answers for "where does X go?":

- A reusable button/input/modal → `src/components/common/`, built on Radix + CVA (see
  Tech Stack). Simple presentational pieces don't need Radix — only reach for a Radix
  primitive when the component needs real interaction/accessibility behavior (focus
  trapping, portals, roving tabindex) that's error-prone to hand-roll.
- A screen/feature → **copy** `features/ExampleWidget` (a data-driven list/search screen) or
  `features/Auth` (a multi-page form flow), whichever shape is closer, rename, gut the logic.
- A protected/role-gated area → wrap the route in `RequireAuth`/`RequireRole`
  (`src/router/guards.tsx`) and put UI-level gating on a piece of content with `Can`
  (`src/components/common/Can.tsx`); `DashboardLayout` + `DashboardRoute` are the reference
  shape for a sidebar-based protected section.
- Data fetching → a TanStack Query hook (never a raw `useEffect` fetch). Failures toast
  automatically via `queryClient.ts`; opt out per-call with `meta: { skipErrorToast: true }`.
- UI-only state → a Zustand store (feature-scoped when feature-specific).
- Form + validation → React Hook Form + a Zod schema in `src/schemas/`, composed from
  `common.schema.ts` primitives where one already exists.
- User-facing text → a key in `src/i18n/locales/<lng>/common.json`, read via
  `useTranslation()`'s `t('KEY')` (or `i18n.t('KEY')` outside a component, e.g. a Zod
  schema) — never hardcode a string in JSX.
- API path → `src/constants/api-routes.ts`.
- A new env var → add it to `.env.example`, `src/vite-env.d.ts`, and the Zod schema in
  `src/constants/env.ts` — an unvalidated `import.meta.env.VITE_X` read is not allowed.

---

## Naming Conventions

- **Components:** PascalCase files + one **named** export (`Button.tsx` → `export function Button`).
- **Hooks:** camelCase with `use` prefix (`useDebouncedValue.ts`).
- **Utils:** camelCase (`getPageCount.ts`).
- **Stores:** `useXStore` in `camelCaseStore.ts`.

---

## Component Conventions

- Props are an explicit TypeScript `interface`; destructure in the signature.
- Optional props use `?` and have defaults. Never `props: any`.
- Do not spread `...props` without extending a typed HTML-attributes interface.
- Reference design tokens only — no arbitrary Tailwind values (`w-[127px]`, `text-[#abc]`),
  **including inside a `cva()` variant map** — the arbitrary-value lint rule only scans JSX
  `className` attributes, not `cva()` call arguments, so this one is on you to hold the line.
- Variant/size props on a common component go through `cva()` (see `Button.tsx`), not manual
  ternary string-building — merge the caller's `className` override with `cn()` last, always.
- No inline `style={{}}`. Class order: layout → display → text → effects → state.
- Buttons always have an explicit `type`. Images always have `alt` (or `alt="" aria-hidden`).
- Reach for a Radix primitive (`@radix-ui/react-*`) for anything with real interaction
  behavior — dialogs, popovers, dropdowns, toasts, tabs. Don't hand-roll focus trapping or
  portal logic that Radix already solved.

---

## Data & State

- **Server state:** TanStack Query only. Validate payloads with Zod at the boundary. Errors
  toast automatically (`queryClient.ts`'s `QueryCache`/`MutationCache` `onError`) — opt a
  specific call out with `meta: { skipErrorToast: true }` when it renders its own inline error.
- **Query keys:** co-locate a key factory with its hook (never a global `queryKeys.ts`),
  structured generic-to-specific so every level is independently invalidatable:
  ```ts
  export const exampleKeys = {
    all: ['example'] as const,
    lists: () => [...exampleKeys.all, 'list'] as const,
    list: (params: Params) => [...exampleKeys.lists(), params] as const,
  };
  ```
  Wrap every `useQuery` in a custom hook — never call it directly in a component. Every
  variable read inside `queryFn` must also be in `queryKey` (treat it like a `useEffect`
  dependency array). Use `placeholderData: keepPreviousData` for paginated/filtered queries.
- **Mutations:** when a mutation should invalidate a cached query (e.g. a create/update/delete
  against a list something on screen already reads via `useQuery`) — confirm success with
  `toast.success(...)` inside the hook's `useMutation({ onSuccess })`, then `return` the result
  of `queryClient.invalidateQueries(...)` from that same `onSuccess` so the mutation stays
  pending until the refetch lands. This is exactly the class of bug `react-doctor`'s
  `query-mutation-missing-invalidation` rule catches — found four real instances of it in this
  boilerplate's own Auth forms during a QA pass; a one-off action with nothing cached to
  invalidate (this repo's `signup`/`forgotPassword`/etc.) is a legitimate exception, not
  something to fake an invalidation call for. Prefer `mutate` over `mutateAsync`; if you must
  use `mutateAsync`, append `.catch(() => {})` (the global `onError` already toasts) instead of
  a try/catch. Put success toast + cache/store updates in the hook's `onSuccess`; put call-site
  UI effects (`navigate`, `form.reset()`) in the `mutate()` call's own `onSuccess` callback —
  never after an `await mutateAsync(...)`, which runs even mid-navigation/unmount.
- **Client/UI state:** Zustand, one slice per domain; feature UI state lives in the feature
  folder. Auth state (`authStore.ts`) is `persist`-backed — it is the single source of truth
  for the bearer token; nothing else touches `localStorage` for it directly.
- **Forms:** React Hook Form + `zodResolver`; share Zod types between form + API. Reuse a
  primitive from `src/schemas/common.schema.ts` (email/password/phone/url) instead of
  redefining validation inline when one already covers the field.
- **Zod v4, not v3.** Use the top-level string formats — `z.email()`, `z.url()`, `z.uuid()` —
  never the deprecated `z.string().email()`. For a required-then-format field, chain
  `z.string().trim().min(1, '<Field> is required').pipe(z.email('Enter a valid email'))` so an
  empty value and a malformed one get distinct messages. `.refine()`'s object form takes
  `{ error, path }`, not `{ message, path }` (v3). Build create/update/filter schema variants
  off one base with `.extend()`/`.pick()`/`.omit()`/`.partial()` — never re-declare fields.
- The Axios client (`api-client.ts`) owns auth-token attach and error normalization
  (`ApiError`); on a 401 it clears the auth store and lets the router redirect (hard-logout,
  not a silent refresh — see `docs/auth-token-refresh.md` if a project genuinely needs the
  latter). Do not create ad-hoc `fetch`/`axios` instances.

---

## Internationalization

Every user-facing string is a key in `src/i18n/locales/<lng>/common.json` — there is no
hardcoded-string escape hatch and no separate `ui-strings.ts`-style constants file.

- **Inside a component:** `const { t } = useTranslation(); ...{t('BUTTON_SAVE')}`.
- **Outside a component** (a Zod schema, `queryClient.ts`'s error handler, anything built
  at module load or in a non-render callback): `import i18n from 'src/i18n'; i18n.t('KEY')`.
- **A prop that overrides default text** (e.g. `ConfirmDialog`'s `confirmLabel`): give the
  prop no default value; resolve the fallback inside the component body with
  `label ?? t('KEY')`. A `useTranslation()` call cannot sit in a default-parameter
  position — that runs before the component (and its hooks) exist.
- **Adding a new language:** copy `locales/en/common.json` to `locales/<lng>/common.json`,
  translate the values (keep every key identical), then add it to the `resources` object in
  `src/i18n/index.ts`. No component changes needed anywhere.

---

## Accessibility (WCAG 2.1 AA — non-negotiable)

Enforced by `eslint-plugin-jsx-a11y`'s dedicated strict lint stage (static, runs on every
commit). There is no runtime a11y test in this boilerplate — treat the checklist below as
something you verify by reading the markup and trying the keyboard/a screen reader yourself.

- Images have `alt` (or `alt="" aria-hidden="true"` when decorative).
- Every input is labeled (`htmlFor`/wrapping); errors linked via `aria-describedby` + `role="alert"`.
- Buttons have an explicit `type`; non-button click handlers add keyboard support (Enter/Space).
- Heading order is not skipped (`h1 → h2 → h3`).
- Contrast ≥ 4.5:1 (normal) / 3:1 (large). Focus is always visible.
- Use semantic HTML first; ARIA only when semantics fall short.

---

## Verifying a change

This boilerplate has **no automated test framework** — no Vitest, no React Testing
Library, no Playwright. That's a deliberate choice to keep the boilerplate lean; a project
built on it is free to add one back (Vitest + RTL is the natural fit for this stack) once
there's enough surface area to justify it.

Until then, verify a change the direct way:

- Run it: `npm run dev`, exercise the actual feature/component you touched.
- Lean on the gate for everything mechanical — types, lint, accessibility lint, style
  consistency, React Doctor — that's what stages 2–6 exist for (see § Quality Gate).
- For anything the gate can't see (does the flow actually make sense, does the API call
  return what you expect), check it by hand before committing.

---

## Styling Tokens

All visual values come from the `@theme` block in `src/index.css` (colors, radius, spacing,
type). Re-skin a project by editing tokens there — never by hardcoding values in components.

- **Never hoist a class string to share it.** The failure mode this guards against: a call
  site needs a look a common component doesn't offer, so someone pulls the classes into a
  shared `const` and imports it everywhere. That constant is a variant with no home — it
  drifts from the component it was copied out of and leaks across features. If a look repeats,
  add it as a real `cva()` variant on the component (see `Button.tsx`'s `variant`/`size`), not
  a floating string.
- **No `dark:` overrides at the call site.** Token-driven styling makes dark mode automatic
  (see `.dark { ... }` in `src/index.css`) — a `dark:bg-...` on a component is a sign the
  _token_ needs a dark-mode value, not that the call site needs a conditional class.

---

## Commit Format (Conventional Commits)

`<type>(<scope>): <subject>` — types: `feat fix refactor perf test docs style build ci chore`.
Subject: lower-case start, no trailing period, ≤ 72 chars. Example:
`feat(components): add UserCard component`.

---

## The Quality Gate (blocks the commit — 6 stages)

`scripts/hooks/pre-commit.mjs`, run by Husky, on staged files:

1. **Guard Rails** — no `console.*`, secrets, merge markers, `as any`, `eslint-disable`, oversized files.
2. **Type Safety** — `tsc -b --noEmit` (strict).
3. **Lint & Conventions** — ESLint (hooks, `jsx-key`, prop types, hardcoded text, tokens).
4. **Accessibility** — strict `jsx-a11y` pass.
5. **Style Consistency** — `impeccable detect` on staged `.tsx`/`.jsx`/`.css` files.
6. **React Diagnostics** — `react-doctor --staged` (supply-chain/Socket.dev scan skipped for
   commit speed; run `npm run doctor` for the full scan including that check).

Run the full gate manually with `npm run verify`. CI re-runs it on every PR, so
`--no-verify` is an emergency escape hatch only — **it still fails CI.**

---

## Never Do (in the boilerplate or any project built on it)

- `as any`, `!` non-null assertions, `@ts-ignore` / `@ts-expect-error`.
- `// eslint-disable` of any kind — fix the code, not the check.
- `console.log` in production code (wrap dev-only logging behind `import.meta.env.DEV`).
- Barrel `index.ts` re-exports for **components** (types may be barrel-exported).
- Array index as React `key`.
- Hardcoded user-facing strings, arbitrary Tailwind values, or inline styles.
- shadcn's default `--primary`/`--secondary`/etc. CSS variable palette — every Radix/CVA
  component still maps onto our own `@theme` tokens in `src/index.css`.
- Reading `import.meta.env.VITE_X` directly outside `src/constants/env.ts` — add the var to
  the Zod schema there instead of reaching around validation.
- Raw `useEffect` data fetching (use TanStack Query).
- `git commit --no-verify` on a developer's behalf.
- Editing `pre-commit.mjs`, ESLint config, or anything under `.claude/`/`.cursor/`
  for a single project's convenience. If a rule is wrong for **every** project, that is a
  boilerplate-repo PR — not a project-repo workaround.

---

## AI Tooling in This Repo

- Rules are defined **only here** — `docs/GUIDE.md` explains them at greater length, never
  redefines them.
- Commands: author once in `.claude/commands/*.md`; `npm run sync:ai` mirrors them to
  `.cursor/commands/` (frontmatter stripped). Set: `/fix-commit`, `/fe-api-guide`,
  `/new-component`, `/new-feature`, `/a11y-audit`, `/perf-audit`, `/code-review`.
- Skills live once in `.claude/skills/` (Cursor loads this folder too). Set: `fe-fix-commit`,
  `fe-api-guide`, `fe-component-scaffold`, `fe-a11y-audit`, `fe-prototype`, `fe-debug`.
- When blocked by the gate, run `/fix-commit` — it fixes the code, never disables checks.
