# Onboarding — Your First Day on a Geeks Frontend

Welcome. This repo is the **Geeks FE boilerplate**: the starting point for every project.
Read this once and you should never need to ask "where does X go?".

## 1. Get running (2 minutes)

```bash
npm install          # also installs Husky hooks + mirrors AI commands
npm run dev          # app on http://localhost:5173 (MSW serves mocked data)
npm run verify       # the full quality gate — run this before committing
```

There is **no real backend**. MSW (Mock Service Worker) answers every request in dev, so
everything runs out of the box.

## 2. Where things go

| You want to add…         | Put it in…                                                             |
| ------------------------ | ---------------------------------------------------------------------- |
| A reusable button/input  | `src/components/common/`                                               |
| A whole screen / feature | **Copy** `src/components/features/ExampleWidget/`, rename, gut it      |
| Data fetching            | A TanStack Query hook (never a raw `useEffect` fetch)                  |
| UI-only state            | A Zustand store (feature-scoped when feature-specific)                 |
| A form                   | React Hook Form + a Zod schema in `src/schemas/`                       |
| User-facing text         | `src/i18n/locales/<lng>/common.json` via `t()` (never hardcode in JSX) |
| An API path              | `src/constants/api-routes.ts`                                          |
| A pure helper            | `src/utils/` (side-effect-free, unit-tested)                           |

**User-facing text is i18next-driven from day one** (`src/i18n/`, not opt-in): add a key to
`src/i18n/locales/en/common.json`, read it with `useTranslation()`'s `t('KEY')`. Adding a
language later means copying that JSON file, translating the values, and registering it in
`src/i18n/index.ts` — no component changes needed anywhere.

The **authoritative rules** live in [`AGENTS.md`](../AGENTS.md). For the same rules
explained at greater length, see [`docs/GUIDE.md`](./GUIDE.md).

## 3. Copy the example — don't invent

`src/components/features/ExampleWidget/` (a data-driven list/search screen) and
`src/components/features/Auth/` (the login/signup/forgot-password/verify/reset flow) are the
two example features. To start a new feature, **copy whichever shape is closer, rename it, and
replace the business logic.** They already wire up typed props, TanStack Query, Zustand,
RHF+Zod, and full accessibility. There's no test file to write — this boilerplate has no
automated test framework; verify by running the app (`npm run dev`).

## 4. The quality gate

Committing runs 6 blocking stages (`scripts/hooks/pre-commit.mjs`): Guard Rails → Type Safety →
Lint & Conventions → Accessibility → Style Consistency → React Diagnostics. If a commit is
blocked, read the message, then run `/fix-commit` (in Cursor or Claude Code) — it fixes the
**code**, never the check. CI re-runs the same gate, so `--no-verify` is an emergency hatch
that still fails CI.

Commits use Conventional Commits: `feat(components): add UserCard component`.

## 5. AI tooling (works the same in Cursor and Claude Code)

- Rules are defined once in `AGENTS.md`. Cursor reads it natively; `CLAUDE.md` imports it.
- Commands live in `.claude/commands/`; `npm run sync:ai` mirrors them to `.cursor/commands/`.
  Available: `/fix-commit`, `/fe-api-guide`, `/new-component`, `/new-feature`, `/a11y-audit`,
  `/perf-audit`, `/code-review`.
- Skills live in `.claude/skills/` (Cursor loads this folder too).

> **Do not** modify `scripts/hooks/pre-commit.mjs`, the ESLint config, or anything under
> `.claude/` or `.cursor/` for a single project's convenience. If a rule is wrong for **every**
> project, that's a boilerplate-repo PR — not a project-repo workaround.

## 6. Opt-in tools (turn on per project, in minutes)

- **Automated tests** — this boilerplate ships with none, on purpose. If a project's surface
  area grows enough to justify it, Vitest + React Testing Library is the natural fit for this
  stack (`npm i -D vitest @testing-library/react jsdom`), wired into stage 5 of the gate.
- **React Doctor** — deterministic React scanner for state & effects, performance, architecture,
  security, and accessibility issues. Already installed. Run `npm run doctor`.
- **Impeccable** — CLI that detects UI anti-patterns and design quality issues (59 rules including
  AI-generated UI tells, accessibility violations, class ordering). Already installed. Run
  `npm run style:check`. There's no CLI auto-fix — use the Impeccable agent skills
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
npm run dev / build / preview
npm run verify          # full gate (type + lint + format)
npm run typecheck | lint | lint:check | format | format:check
npm run gate            # run the 6-stage pre-commit gate manually
npm run sync:ai         # regenerate .cursor/commands from .claude/commands
```
