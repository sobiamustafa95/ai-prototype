# Geeks FE Boilerplate

A company-wide, **domain-agnostic**, production-grade React + Vite boilerplate. Clone it, run
one command, and start any project (dashboard, marketing site, internal tool, portal, admin
panel) inside a consistent, pre-guarded architecture — with quality enforced by tooling, not
by discipline.

## Quick start

```bash
npm install     # installs deps, Husky hooks, and mirrors AI commands
npm run dev      # http://localhost:5173 — runs with MSW-mocked data, no backend needed
npm run verify   # full quality gate; run before every commit
```

New here? Read **[`docs/GUIDE.md`](./docs/GUIDE.md)** — the complete A–Z guide (what this is, how
to use it, the tools, and how to extend it), written for interns and seniors alike. For the fast
day-one version see **[`docs/onboarding.md`](./docs/onboarding.md)**. The authoritative rules are
in **[`AGENTS.md`](./AGENTS.md)**.

## Tech stack

Vite · TypeScript (strict) · React 18+ (function components only) · React Router v7 (data
router) · Tailwind CSS v4 (`@theme` tokens) · Zustand · TanStack Query v5 · React Hook Form +
Zod · Axios · i18next (JSON-driven, mandatory for all text) · MSW (dev-time API mocking) ·
ESLint (flat) + Prettier · Husky + lint-staged + commitlint. No automated test framework by
design — see `AGENTS.md` § Verifying a change.

## Project layout

```
src/components/{common,features,layouts}   utils/ hooks/ services/ stores/
src/{schemas,types,constants,router,mocks,i18n}
scripts/hooks/pre-commit.mjs   scripts/sync-ai-config.mjs
AGENTS.md  CLAUDE.md  .cursor/{rules,commands}  .claude/{commands,skills}
docs/{onboarding.md,quality-gate/}  .github/workflows/
```

See `AGENTS.md` § Directory Map for what belongs where.

## The quality gate (blocks the commit)

`scripts/hooks/pre-commit.mjs` runs 6 stages on staged files, and CI re-runs the same checks:

1. **Guard Rails** — no `console.*`, secrets, merge markers, `as any`, `eslint-disable`, big files
2. **Type Safety** — `tsc -b --noEmit` (strict)
3. **Lint & Conventions** — ESLint (hooks, `jsx-key`, prop types, hardcoded text, tokens)
4. **Accessibility** — strict `jsx-a11y` (WCAG 2.1 AA)
5. **Style Consistency** — `impeccable detect` (staged `.tsx`/`.jsx`/`.css`)
6. **React Diagnostics** — `react-doctor --staged`

`--no-verify` is an emergency escape hatch only — **it still fails CI.**

## Scripts

| Script                                      | Does                                                    |
| ------------------------------------------- | ------------------------------------------------------- |
| `npm run dev` / `build` / `preview`         | Vite dev / prod build / preview                         |
| `npm run verify`                            | Full gate: typecheck + lint + format                    |
| `npm run gate`                              | Run the 6-stage pre-commit gate manually                |
| `npm run typecheck` / `lint` / `lint:check` | Types / ESLint fix / ESLint check                       |
| `npm run format` / `format:check`           | Prettier write / check                                  |
| `npm run sync:ai`                           | Regenerate `.cursor/commands/` from `.claude/commands/` |
| `npm run doctor` / `style:check`            | React Doctor / Impeccable (opt-in)                      |

## How AI tooling works here (Cursor ⇄ Claude Code)

One source of truth: **`AGENTS.md`**. Cursor reads it natively; `CLAUDE.md` imports it;
`.cursor/rules/*.mdc` only add glob-scoped pointers. Slash commands are authored once in
`.claude/commands/` and mirrored to `.cursor/commands/` by `npm run sync:ai`. Deeper playbooks
are Agent Skills in `.claude/skills/` (Cursor reads that folder too). Ask either tool "what are
this project's component conventions?" and you get the same answer, because both read `AGENTS.md`.

## Domain-agnostic by design

Nothing assumes what the app does. The only example feature is
`src/components/features/ExampleWidget/` — **copy it, rename it, gut the logic** to start a real
feature. See `docs/onboarding.md` for the day-one workflow.
