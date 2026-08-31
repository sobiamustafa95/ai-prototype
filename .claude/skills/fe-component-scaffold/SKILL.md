---
name: fe-component-scaffold
description: Use when creating a new React component or feature folder. Starts by pinning down the component's identity (name + feature/purpose) and whether a design reference exists (Figma/pen.dev frame + screenshot, or none), then scaffolds it — typed props interface, and (for features) a required README — following the ExampleWidget shape and matching the existing design system.
---

# Scaffolding a component or feature

Authoritative conventions: `AGENTS.md` § Component Conventions and § Directory Map.
Reference implementation: `src/components/example/`.

Every component built through this skill goes through four steps, in order:
**1) identity → 2) reference check → 3) duplicate check → 4) build.** Don't skip straight to code.

## Step 1 — Pin down identity

Before writing anything, confirm out loud (or ask if not given):

- **Name** — PascalCase, specific to what it does (not `Card2` or `Wrapper`).
- **Feature/purpose** — one sentence: what it's for and where it lives
  (`src/components/common/<Name>/` for a reusable primitive, `src/components/<concern>/`
  for a non-portal-specific feature screen/flow — e.g. `auth/`, `example/` — or
  `src/components/<portal>/` for one scoped to a single portal/area).
- **Reusability shape** — what varies per caller (variants, sizes, content via `children`,
  data via props) vs what's fixed. A component hardcoded to one call site's copy or data
  is not done — push anything caller-specific into props.

## Step 2 — Reference check

Ask the user (use `AskUserQuestion` if it's not already obvious from the conversation):

> "Is there a design reference for this component, or should I design it?"

**Option A — There is a reference.**
A Figma frame or a pen.dev (`.pen`) frame.

- **pen.dev / `.pen` file**: don't ask for a screenshot — read the file directly via the
  Pencil MCP tools (`get_app_state` with `include_schema` + `include_canvas_design`, then
  `get_guidelines`). Build straight from that schema.
- **Figma (or anything without an MCP reader)**: ask the user for a screenshot of the frame
  — a link alone isn't enough visibility. Zoom/crop so spacing, states (hover/disabled/error),
  and text are legible.
- Build a **faithful port** of that reference — same structure, states, and content shape —
  re-expressed 100% through this repo's standards (Step 4). This is not a redesign: don't
  improvise layout the reference didn't show, but do translate colors/spacing/type to our
  `@theme` tokens rather than eyeballing arbitrary values.

**Option B — No reference.**
Ask a follow-up: _"Should I design it, or will you provide a screenshot/description to match?"_

- **B1 — Design it.** Before laying anything out, look at 2–3 existing common components
  (e.g. `Button.tsx`, `Input.tsx`, `Dialog.tsx`) to read the current spacing scale, radius,
  color tokens, and interaction patterns, then design the new one to feel like it belongs
  next to them — same density, same states, same token usage.
- **B2 — User provides reference material.** Take whatever they give (screenshot, described
  layout) and build it so it matches the existing theme (`@theme` tokens in `src/index.css`),
  color palette, and component patterns already in the repo — consistency with what exists
  beats matching the reference pixel-for-pixel if the two conflict.

## Step 3 — Duplicate check (mandatory, not a suggestion)

Before writing any new component code, actually look for something that already does this —
don't rely on remembering the repo from earlier in the conversation:

- List `src/components/common/` and, if Step 1 named a concern/portal folder, that folder too
  (`src/components/<concern>/` or `src/components/<portal>/`). Read the props/purpose of
  anything that looks related, not just filenames that happen to match.
- Decide, and act accordingly:
  - **Near-duplicate exists** (same core purpose — e.g. a generic table, a generic list, a
    generic modal — missing only a variant/prop/size the new use case needs) → extend the
    existing component (a new `cva()` variant, a new prop, a new size) instead of scaffolding
    a parallel one. Implement inside that existing file and stop here — do not continue to
    Step 4 as if this were a new component.
  - **No real overlap** → proceed to Step 4.
  - **Ambiguous** (partial overlap; extending might compromise the existing component's
    simplicity or its other callers) → ask the user directly, e.g.: _"This repo already has
    `<X>` in `src/components/common/`, which does `<Y>`. Do you want me to extend it, or is
    this genuinely a separate component?"_ Do not decide unilaterally — a duplicate primitive
    that quietly drifts from its sibling is exactly the failure mode this step exists to
    prevent (see `AGENTS.md`'s Never-list: a component that only works for its first call site
    belongs in props, not a copy-paste).

## Step 4 — Build

### A common component (`src/components/common/<Name>/` or file)

- `<Name>.tsx` — `interface <Name>Props`, single **named** export, variants/sizes through
  `cva()` (not ternary strings), caller `className` merged last with `cn()`, explicit button
  `type`, labeled inputs, tokens-only Tailwind (including inside `cva()` variant maps — the
  lint rule doesn't scan those), text from `src/i18n/locales/<lng>/common.json` via
  `useTranslation()`'s `t('KEY')` — never a hardcoded string, never a default-parameter
  value (a hook can't sit in a default-parameter position — resolve `prop ?? t('KEY')`
  inside the function body instead).
- **No test file for this component on its own.** This repo tests at the workflow level,
  not the isolated-primitive level — a common primitive gets exercised through whichever
  feature workflow test(s) actually use it, not a standalone unit test of its own. See
  `AGENTS.md` § Testing.

Verify by running it (`pnpm dev`) too, checking it against the identity/reusability
decided in Step 1.

### A feature (`src/components/<concern-or-portal>/<Name>/`)

Copy `src/components/example/` and rename; gut the logic. Its hooks live in
`src/hooks/common/`, not the component folder — copy those too, into
`src/hooks/<concern>/` for the new feature (`common/` unless the feature is genuinely
role-specific), not alongside `<Name>.tsx`. Keep:

- `<Name>.tsx` (component), `<name>Store.ts` (feature-scoped Zustand UI state, if needed),
  and a **required** `README.md` (what it does, key components, state approach, API
  dependency).
- `use<Name>*.ts` (TanStack Query hook, Zod-validated, keyed off a new member on
  `src/constants/queryKeys.ts`'s global `QueryKey` enum — never a per-feature key
  factory) under `src/hooks/<concern>/<hookName>.ts` — company-wide convention, never
  co-located inside the feature's own component folder. `src/hooks/common/
useExampleItems.ts` is the reference shape.
- `<Name>.workflow.test.tsx`, co-located, **mandatory** for a feature — copy
  `ExampleWidget.workflow.test.tsx`'s shape and adapt it to this feature's real flow (load →
  interact → success/empty/error), through `renderWithProviders` and the real MSW-backed
  network layer (`src/mocks/handlers.ts` — add a scenario there if the feature's backend can
  respond in a new way a test needs, never an inline mock bypassing MSW). A feature that
  splits into multiple pieces (e.g. `AddXModal`, `EditXModal`) gets one
  `<Piece>.workflow.test.tsx` per piece, in the same folder — never a separate parallel test
  folder. See `AGENTS.md` § Testing for the full scope/naming rules.

Add the matching thin route wrapper in `src/pages/common/<Name>Page.tsx` (or
`src/pages/<portal>/` for a portal-specific feature) — see `src/pages/README.md`. Wire the
route per `AGENTS.md`/`docs/onboarding.md`'s routing walkthrough: role-gated → registered in
`ProtectedRoutes.tsx`; guest-only → `PublicRoutes.tsx`; reachable whether signed in or not
(the `ExamplePage` shape this skill scaffolds from) → its own hardcoded `<Route>` in
`AppRouters.tsx`'s public shell block, not a registry entry in either file above.

## Never

- Barrel `index.ts` for components. Hardcoded strings. Arbitrary Tailwind values. `props: any`.
- A component that only works for its first call site — if a second usage would need to
  fork it, its variance belongs in props, not a copy-paste.

Finish by running `pnpm verify`.
