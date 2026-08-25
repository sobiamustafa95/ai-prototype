---
name: fe-component-scaffold
description: Use when creating a new React component or feature folder. Starts by pinning down the component's identity (name + feature/purpose) and whether a design reference exists (Figma/pen.dev frame + screenshot, or none), then scaffolds it — typed props interface, and (for features) a required README — following the ExampleWidget shape and matching the existing design system.
---

# Scaffolding a component or feature

Authoritative conventions: `AGENTS.md` § Component Conventions and § Directory Map.
Reference implementation: `src/components/features/ExampleWidget/`.

Every component built through this skill goes through three steps, in order:
**1) identity → 2) reference check → 3) build.** Don't skip straight to code.

## Step 1 — Pin down identity

Before writing anything, confirm out loud (or ask if not given):

- **Name** — PascalCase, specific to what it does (not `Card2` or `Wrapper`).
- **Feature/purpose** — one sentence: what it's for and where it lives
  (`src/components/common/<Name>/` for a reusable primitive, or
  `src/components/features/<Name>/` for a feature screen/flow).
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
  re-expressed 100% through this repo's standards (Step 3). This is not a redesign: don't
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

## Step 3 — Build

### A common component (`src/components/common/<Name>/` or file)

- `<Name>.tsx` — `interface <Name>Props`, single **named** export, variants/sizes through
  `cva()` (not ternary strings), caller `className` merged last with `cn()`, explicit button
  `type`, labeled inputs, tokens-only Tailwind (including inside `cva()` variant maps — the
  lint rule doesn't scan those), text from `src/i18n/locales/<lng>/common.json` via
  `useTranslation()`'s `t('KEY')` — never a hardcoded string, never a default-parameter
  value (a hook can't sit in a default-parameter position — resolve `prop ?? t('KEY')`
  inside the function body instead).

This boilerplate has no automated test framework — verify a component by running it
(`npm run dev`) and checking it against the identity/reusability decided in Step 1, not
by writing a test file.

### A feature (`src/components/features/<Name>/`)

Copy `ExampleWidget/` and rename; gut the logic. Keep:

- `<Name>.tsx` (component), `use<Name>*.ts` (TanStack Query hook, Zod-validated),
  `<name>Store.ts` (feature-scoped Zustand UI state, if needed), and a **required**
  `README.md` (what it does, key components, state approach, API dependency).

## Never

- Barrel `index.ts` for components. Hardcoded strings. Arbitrary Tailwind values. `props: any`.
- A component that only works for its first call site — if a second usage would need to
  fork it, its variance belongs in props, not a copy-paste.

Finish by running `npm run verify`.
