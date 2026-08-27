---
description: Scaffold a new feature folder by copying the ExampleWidget shape.
argument-hint: '<FeatureName>'
allowed-tools: Read, Write
---

Scaffold a new feature named: $ARGUMENTS

Copy the shape of `src/components/example/` (see `AGENTS.md` § Directory Map). A component
that isn't portal-specific gets its own folder at `src/components/<FeatureName>/` (same level
as `common/`, `auth/`, `example/`); a portal-specific one gets `src/components/<portal>/`.

Create `src/components/<FeatureName>/`:

- `<FeatureName>.tsx` — feature component (typed props, tokens, full a11y).
- `use<FeatureName>*.ts` — TanStack Query data hook (Zod-validate the payload at the boundary).
- `<featureName>Store.ts` — feature-scoped Zustand store for UI state (if needed).
- `README.md` — REQUIRED: what it does, key components, state approach, API dependency.
- `<FeatureName>.workflow.test.tsx` — REQUIRED: copy `ExampleWidget.workflow.test.tsx`'s
  shape (load → interact → success/empty/error) and adapt it to this feature's real flow,
  via `renderWithProviders` and the real MSW-backed network layer. A feature split into
  multiple pieces gets one `<Piece>.workflow.test.tsx` per piece, same folder — see
  `AGENTS.md` § Testing.

Create the matching thin route wrapper in `src/pages/common/<FeatureName>Page.tsx` (or
`src/pages/<portal>/` for a portal-specific feature) — layout glue (`Seo`, headings) and
route wiring only, no business logic (see `src/pages/README.md`).

Add any API paths to `src/constants/api-routes.ts` and Zod schemas to `src/schemas/`.
Do not hardcode business logic that belongs to a specific project. Then run `pnpm verify`.
