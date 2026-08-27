<!-- AUTO-GENERATED from .claude/commands — edit the source, then run `npm run sync:ai`. -->

Scaffold a new feature named: $ARGUMENTS

Copy the shape of `src/components/features/ExampleWidget/` (see `AGENTS.md` § Directory Map).

Create `src/components/features/<FeatureName>/`:

- `<FeatureName>.tsx` — feature component (typed props, tokens, full a11y).
- `use<FeatureName>*.ts` — TanStack Query data hook (Zod-validate the payload at the boundary).
- `<featureName>Store.ts` — feature-scoped Zustand store for UI state (if needed).
- `README.md` — REQUIRED: what it does, key components, state approach, API dependency.

Add any API paths to `src/constants/api-routes.ts` and Zod schemas to `src/schemas/`.
Do not hardcode business logic that belongs to a specific project. Then run `npm run verify`.
