# The Complete Guide — Geeks FE Boilerplate

> One document, A–Z. Read it once and you'll understand **what this boilerplate is, how to
> use it, why it exists, and how to extend it**. Written so an intern and a senior both get it.

---

## 1. What is this? (in one line)

A ready-made **React + Vite + TypeScript** starting point for every Geeks project, where
code quality (types, accessibility, style, React best practices) is enforced **automatically
by tools** — not by remembering rules.

You clone it, run one command, and you already have a professional, guarded project.

---

## 2. Why it exists (the benefits)

| Problem on a normal project         | How this boilerplate solves it                               |
| ----------------------------------- | ------------------------------------------------------------ |
| Every project is set up differently | One consistent structure for **all** projects                |
| Bad code slips into the repo        | A **quality gate** blocks it at commit time                  |
| "Where does this file go?"          | A fixed folder map answers every "where?"                    |
| Accessibility (a11y) is forgotten   | A strict `jsx-a11y` lint pass blocks the commit              |
| React code rots into anti-patterns  | React Doctor scans every commit for state/effect/perf issues |
| AI tools give different answers     | Cursor **and** Claude Code read the same rulebook            |
| New devs take days to onboard       | Copy one example feature and go                              |

**Bottom line:** you focus on building features; the tooling keeps quality high.

---

## 3. Before you start (prerequisites)

- **Node.js 22 or newer** (check with `node --version`).
- **npm** (comes with Node).
- An editor: **VS Code**, **Cursor**, or **Claude Code** all work. AI features are a bonus, not a requirement.

---

## 4. Get started (2 minutes)

```bash
npm install      # installs everything + sets up the commit hooks + syncs AI commands
npm run dev      # opens the app at http://localhost:5173 (fake data via MSW, no backend needed)
```

Before committing, you can run the full check yourself:

```bash
npm run verify   # types + lint + format
```

There is **no real backend**. MSW (Mock Service Worker) answers all API calls in dev and tests,
so everything runs out of the box.

---

## 5. How it works (the everyday flow)

```
   write code  ──►  git commit  ──►  Quality Gate runs (6 stages)
                                        │
                          ┌─────────────┴─────────────┐
                          ▼                           ▼
                    ✅ all pass                  ❌ something fails
                     commit saved            commit blocked + reason shown
                          │                           │
                     git push                  fix code, commit again
                          │
                          ▼
                 GitHub CI re-runs the same checks (safety net)
```

- The gate runs **locally** when you commit (via a Husky hook).
- The **same** checks run again on **GitHub** (CI) after you push — so nothing bad reaches the team.
- If a commit is blocked, read the message, fix the **code** (never disable the check), and commit again.

---

## 6. Folder structure (where everything goes)

```
src/
  components/
    common/       Reusable UI (Button, Input, Dialog, Toaster, ThemeToggle, DataTable,
                  SearchInput, Can, …) — Radix + CVA, no business logic
    features/     Whole screens/features — ExampleWidget (list/search) and Auth
                  (login/signup/forgot-password/verify/reset); copy either to start one
    layouts/      Page shells (AppLayout, AuthLayout, ErrorLayout, DashboardLayout)
  hooks/          Generic reusable hooks (e.g. useDebouncedValue, useThemeSync)
  lib/            utils.ts — the cn() class-merge helper used by every common component
  services/       api-client (Axios), queryClient, authService
  utils/          Pure helper functions (easy to unit-test)
  schemas/        Zod schemas (form + API validation); common.schema.ts for shared primitives
  types/          Shared TypeScript interfaces
  constants/      api-routes.ts, config.ts, env.ts (Zod-validated env)
  i18n/           i18next setup + locales/<lng>/common.json — the only source of text
  router/         Routes (createBrowserRouter) + guards (RequireAuth, RequireRole)
  stores/         Zustand stores (UI/client state); authStore is persist-backed
  mocks/          MSW handlers (fake API, dev-time only)

components.json                shadcn CLI config — `npx shadcn add <component>` to pull more
scripts/hooks/pre-commit.mjs   The 6-stage quality gate
scripts/sync-ai-config.mjs     Mirrors Claude commands → Cursor commands
AGENTS.md                      THE rulebook (single source of truth)
CLAUDE.md                      Imports AGENTS.md for Claude Code
.cursor/{rules,commands}       Cursor's AI config
.claude/{commands,skills}      Claude's AI config
docs/                          This guide, onboarding, deep-dive docs
.github/workflows/             CI (runs the gate on GitHub)
```

**Quick answers to "where does X go?"**

| I want to add…          | Put it in…                                                    |
| ----------------------- | ------------------------------------------------------------- |
| A reusable button/input | `src/components/common/`                                      |
| A whole screen/feature  | Copy `src/components/features/ExampleWidget/`, rename, gut it |
| Data fetching           | A TanStack Query hook (never a raw `useEffect` fetch)         |
| UI-only state           | A Zustand store                                               |
| A form                  | React Hook Form + a Zod schema in `src/schemas/`              |
| User-facing text        | A key in `src/i18n/locales/<lng>/common.json`, via `t()`      |
| An API path             | `src/constants/api-routes.ts`                                 |
| A pure helper           | `src/utils/`                                                  |

---

## 7. The Quality Gate (6 stages)

Every commit runs these, in order. Any failure blocks the commit:

1. **Guard Rails** — no `console.log`, secrets, `as any`, `eslint-disable`, merge markers, oversized files.
2. **Type Safety** — TypeScript strict check (`tsc -b --noEmit`).
3. **Lint & Conventions** — ESLint (React hooks rules, keys, no hardcoded text, design tokens only).
4. **Accessibility** — strict `jsx-a11y` rules (WCAG 2.1 AA).
5. **Style Consistency** — `impeccable detect` on staged `.tsx`/`.jsx`/`.css` files.
6. **React Diagnostics** — `react-doctor --staged` (the Socket.dev supply-chain scan is skipped
   here for commit speed; run `npm run doctor` for the full scan).

This boilerplate has no automated test framework by design (see `AGENTS.md` § Verifying a
change) — verify a change by running it (`npm run dev`), not by writing a test.

Run it manually anytime: `npm run gate`.

---

## 8. Everyday commands

| Command                           | What it does                                        |
| --------------------------------- | --------------------------------------------------- |
| `npm run dev`                     | Start the dev server                                |
| `npm run build` / `preview`       | Production build / preview it                       |
| `npm run verify`                  | Full check: types + lint + format                   |
| `npm run gate`                    | Run the 6-stage commit gate manually                |
| `npm run lint` / `lint:check`     | ESLint auto-fix / check-only                        |
| `npm run format` / `format:check` | Prettier write / check                              |
| `npm run doctor`                  | React Doctor scan (React anti-patterns)             |
| `npm run style:check`             | Impeccable scan (UI anti-patterns / design quality) |
| `npm run sync:ai`                 | Rebuild `.cursor/commands` from `.claude/commands`  |

---

## 9. How to build a new feature (the golden workflow)

**Don't start from scratch — copy the example.**

1. Copy `src/components/features/ExampleWidget/` to a new folder, e.g. `UserProfile/`.
2. Rename files and the component, then replace the logic with yours.
3. It already wires up: typed props, a TanStack Query hook, a Zustand store, a form with Zod
   validation, full accessibility, and a README.

For a single reusable component instead, ask your AI tool for `/new-component`, or copy
`src/components/common/Button.tsx` as a template.

---

## 10. The tools (what each one is for)

| Tool                      | Job in this project                                         |
| ------------------------- | ----------------------------------------------------------- |
| **Vite**                  | Fast dev server + production builder                        |
| **TypeScript (strict)**   | Type safety — catches bugs before runtime                   |
| **React 18+**             | UI, function components + hooks only                        |
| **Radix UI + CVA**        | Accessible UI primitives + variant styling (shadcn pattern) |
| **React Router v7**       | Routing (data router)                                       |
| **Tailwind CSS v4**       | Styling via design tokens in `src/index.css`                |
| **Zustand**               | Client / UI state                                           |
| **TanStack Query v5**     | Server state / data fetching + caching                      |
| **React Hook Form + Zod** | Forms + validation (shared types)                           |
| **Axios**                 | HTTP client with auth + error handling                      |
| **i18next**               | All user-facing text — JSON-driven, mandatory (not opt-in)  |
| **MSW**                   | Fake API for local dev — no backend needed to run the app   |
| **ESLint + Prettier**     | Code rules + auto-formatting                                |
| **Husky + lint-staged**   | Runs the gate automatically on commit                       |
| **commitlint**            | Enforces Conventional Commit messages                       |
| **React Doctor**          | Scans React code for state/effect/perf/security/a11y issues |
| **Impeccable**            | Scans for UI anti-patterns & design-quality issues          |

---

## 11. AI tooling — same answers in Cursor & Claude Code

- **`AGENTS.md`** is the single rulebook. Cursor reads it natively; `CLAUDE.md` just imports it.
- **Slash commands** are written once in `.claude/commands/` and mirrored to `.cursor/commands/`
  by `npm run sync:ai`. Available: `/fix-commit`, `/new-component`, `/new-feature`,
  `/fe-api-guide`, `/a11y-audit`, `/perf-audit`, `/code-review`.
- **Skills** (deeper playbooks) live in `.claude/skills/`; Cursor reads that folder too.

Ask either tool "what are this project's component conventions?" → you get the **same answer**,
because both read `AGENTS.md`.

> Using plain VS Code (no AI)? Everything still works — the quality gate is just npm scripts.
> The AI commands are a convenience, not a requirement.

---

## 12. How to extend / update it (for the future)

Everything below is a small, safe edit. Commit it like any other change.

### Add a new AI slash command

1. Create `.claude/commands/my-command.md` (add a short YAML frontmatter + instructions).
2. Run `npm run sync:ai` — it appears in `.cursor/commands/` automatically.

### Add a new AI skill (playbook)

1. Create a folder `.claude/skills/my-skill/` with a `SKILL.md` inside.
2. Describe when to use it and the steps. Cursor and Claude both pick it up.

### Add a new Cursor rule (glob-scoped hint)

1. Create `.cursor/rules/my-rule.mdc`.
2. Keep it a **pointer** to `AGENTS.md` — don't duplicate rules there.

### Add or change a lint rule

1. Edit `eslint.config.js`.
2. Run `npm run lint:check` to confirm nothing unexpected breaks.

### Change the look (colors, spacing, radius, fonts)

1. Edit the `@theme` block in `src/index.css` — that's the single place for design tokens.
2. Never hardcode values in components; always reference tokens.

### Change the commit gate itself

1. Edit `scripts/hooks/pre-commit.mjs`.
2. **Rule of thumb:** only change the gate if it's wrong for **every** project — that's a
   boilerplate change, not a per-project tweak.

### Bump the Node version

1. Update `engines.node` in `package.json` **and** `node-version` in `.github/workflows/quality-gate.yml`
   (keep them in sync so local and CI match).

---

## 13. Troubleshooting (common issues)

| Symptom                                        | Cause & fix                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| Commit is blocked with a stage error           | Read the message; fix the code, then commit again. Or run `/fix-commit`. |
| CI is red but local passed                     | Usually a Node version mismatch — make sure you're on Node 22+.          |
| `markAsUncloneable is not a function` in tests | Node too old. Use Node 22 or newer.                                      |
| A commit message is rejected                   | Use Conventional Commits: `feat(scope): message` (lowercase, no period). |
| I really must skip the gate                    | `--no-verify` exists but **still fails CI** — emergency only.            |

---

## 14. The golden rules (never do these)

- ❌ `as any`, `!` non-null assertions, `@ts-ignore` — fix the types instead.
- ❌ `// eslint-disable` — fix the code, not the check.
- ❌ `console.log` in production code.
- ❌ Hardcoded user-facing text, arbitrary Tailwind values (`w-[127px]`), or inline styles.
- ❌ Raw `useEffect` for data fetching — use TanStack Query.
- ❌ Editing the gate/ESLint/AI config for one project's convenience.

---

## 15. Where to go next

- **[`docs/onboarding.md`](./onboarding.md)** — the fast day-one version of this guide.
- **[`AGENTS.md`](../AGENTS.md)** — the authoritative rulebook.

That's the whole boilerplate, A–Z. Copy the example, respect the gate, and ship with confidence.
