# Onboarding — Your First Day on a Geeks Frontend

Welcome. This repo is the **Geeks FE boilerplate**: the starting point for every project.
Read this once and you should never need to ask "where does X go?".

## 1. Get running (2 minutes)

```bash
pnpm install         # installs deps + sets up Husky hooks (never rewrites tracked files)
pnpm dev             # app on http://localhost:5173 (MSW serves mocked data)
pnpm verify          # the full quality gate — run this before committing
```

There is **no real backend**. MSW (Mock Service Worker) answers every request in dev, so
everything runs out of the box.

## 2. Where things go

| You want to add…         | Put it in…                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------- |
| A reusable button/input  | `src/components/common/`                                                                |
| A whole screen / feature | **Copy** `src/components/example/` + `src/pages/common/ExamplePage.tsx`, rename, gut it |
| Data fetching            | A TanStack Query hook (never a raw `useEffect` fetch)                                   |
| UI-only state            | A Zustand store (feature-scoped when feature-specific)                                  |
| A form                   | React Hook Form + a Zod schema in `src/schemas/`                                        |
| User-facing text         | `src/i18n/locales/<lng>/common.json` via `t()` (never hardcode in JSX)                  |
| An API path              | `src/constants/api-routes.ts`                                                           |
| A pure helper            | `src/utils/` (side-effect-free, unit-tested)                                            |

**User-facing text is i18next-driven from day one** (`src/i18n/`, not opt-in): add a key to
`src/i18n/locales/en/common.json`, read it with `useTranslation()`'s `t('KEY')`. Adding a
language later means copying that JSON file, translating the values, and registering it in
`src/i18n/index.ts` — no component changes needed anywhere.

The **authoritative rules** live in [`AGENTS.md`](../AGENTS.md). For the same rules
explained at greater length, see [`docs/GUIDE.md`](./GUIDE.md).

## 3. Copy the example — don't invent

`src/components/example/` + `src/pages/common/ExamplePage.tsx` (a data-driven list/search
screen) and `src/components/auth/` + `src/pages/auth/` (the login/signup/forgot-password/
verify/reset flow) are the two example features. To start a new feature, **copy whichever
shape is closer, rename it, and replace the business logic.** A component that isn't
portal-specific gets its own folder at `components/<concern>/` (same level as `common/`); a
portal-specific one gets `components/<portal>/`, mirrored by `pages/<portal>/`. They already
wire up typed props, TanStack Query, Zustand, RHF+Zod, and full accessibility. Add a
`ComponentName.workflow.test.tsx` next to it (Vitest + React Testing Library — see `AGENTS.md`
§ Testing) covering the same shape as `ExampleWidget.workflow.test.tsx`/
`SignupForm.workflow.test.tsx` — this repo tests real workflows end-to-end, not individual
primitives — and verify the rest by running the app (`pnpm dev`).

## 4. The quality gate

`pnpm verify` is the single canonical gate — 11 checks (Guard Rails → AI-command Sync → Lint
Config Contract → Type Safety → Tests → Lint & Conventions → Accessibility → Format → Style
Consistency → React Diagnostics → Build), each its own `check:*`/`ai:check` script in
`package.json`. Committing runs most of these via `scripts/hooks/pre-commit.mjs`, scoped to
just your staged files for speed — a couple (like the build and the test suite) are
whole-repo concerns a staged scan can't meaningfully speed up. CI runs nothing but `pnpm
verify` itself. One rule set,
three entry points — a green `pnpm verify` locally means the hook and CI will pass too.
See `AGENTS.md` § Checks vs Fixes for which commands are safe to run without reading first.

If a commit is blocked, read the message, then run `/fix-commit` (in Cursor or Claude Code) —
it fixes the **code**, never the check. `--no-verify` is an emergency hatch that still fails CI.

Commits use Conventional Commits: `feat(components): add UserCard component`.

## 5. AI tooling (works the same in Cursor and Claude Code)

- Rules are defined once in `AGENTS.md`. Cursor reads it natively; `CLAUDE.md` imports it.
- Commands live in `.claude/commands/`; `pnpm ai:sync` mirrors them to `.cursor/commands/` —
  a forgotten sync fails `pnpm ai:check` (part of `verify`), not silently, so this can't drift.
  Available: `/fix-commit`, `/fe-api-guide`, `/new-component`, `/new-feature`, `/a11y-audit`,
  `/perf-audit`, `/code-review`.
- Skills live in `.claude/skills/` (Cursor loads this folder too).

> **Do not** modify `scripts/hooks/pre-commit.mjs`, the ESLint config, or anything under
> `.claude/` or `.cursor/` for a single project's convenience. If a rule is wrong for **every**
> project, that's a boilerplate-repo PR — not a project-repo workaround.

## 6. Opt-in tools (turn on per project, in minutes)

- **Automated tests** — Vitest + React Testing Library, already installed and wired into
  `pnpm verify` (`check:test`). Run `pnpm test` (watch) or `pnpm test:run` (single run). See
  `AGENTS.md` § Testing for what to test and what to avoid. No coverage thresholds — a
  separate, opt-in decision if a project wants one.
- **React Doctor** — deterministic React scanner for state & effects, performance, architecture,
  security, and accessibility issues. Already installed. Run `pnpm doctor`.
- **Impeccable** — CLI that detects UI anti-patterns and design quality issues (59 rules including
  AI-generated UI tells, accessibility violations, class ordering). Already installed. Run
  `pnpm style:check`. There's no CLI auto-fix — use the Impeccable agent skills
  (`/polish`, `/harden`, etc., see § 9) to actually fix what it flags.
- **Oxlint (future — Phase 15)** — an optional very-fast correctness pre-pass in CI, layered
  **alongside** ESLint (not replacing it — jsx-a11y/react-hooks parity isn't there yet).

## 7. Design → code with Pencil.dev (optional)

[Pencil.dev](https://pencil.dev) is a Figma-like canvas that lives inside Cursor/VS Code and
stores `.pen` design files in the repo (Git-versioned, alongside code), generating React
components from Figma imports or natural-language prompts. If you use it, keep design files
under a top-level `/design` folder. It's a **design-time** tool — it is intentionally not wired
into the build/commit gate.

## 8. Handy scripts

```bash
pnpm dev / build / preview
pnpm verify              # THE canonical gate — all 11 checks, full-repo
pnpm gate                # most of the same checks, scoped to staged files (what commit runs)
pnpm check:<name>        # run one check standalone: guardrails/lint-contract/types/test/lint/a11y/format/style/doctor/build
pnpm test / test:run     # Vitest watch mode / single run (test:run is what check:test runs)
pnpm lint / format       # check-only, non-mutating — pnpm lint:fix / format:fix to actually write fixes
pnpm ai:sync             # regenerate .cursor/commands from .claude/commands (mutating)
pnpm ai:check            # verify .cursor/commands isn't stale (non-mutating; part of verify)
```
