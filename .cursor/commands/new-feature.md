<!-- AUTO-GENERATED from .claude/commands — edit the source, then run `pnpm ai:sync`. -->

Scaffold a new feature named: $ARGUMENTS

Copy the shape of `src/components/example/` (see `AGENTS.md` § Directory Map). A component
that isn't portal-specific gets its own folder at `src/components/<FeatureName>/` (same level
as `common/`, `auth/`, `example/`); a portal-specific one gets `src/components/<portal>/`.

Create `src/components/<FeatureName>/`:

- `<FeatureName>.tsx` — feature component (typed props, tokens, full a11y).
- `<featureName>Store.ts` — feature-scoped Zustand store for UI state (if needed).
- `README.md` — REQUIRED: what it does, key components, state approach, API dependency.
- `<FeatureName>.workflow.test.tsx` — REQUIRED: copy `ExampleWidget.workflow.test.tsx`'s
  shape (load → interact → success/empty/error) and adapt it to this feature's real flow,
  via `renderWithProviders` and the real MSW-backed network layer. A feature split into
  multiple pieces gets one `<Piece>.workflow.test.tsx` per piece, same folder — see
  `AGENTS.md` § Testing.

Create `src/hooks/<concern>/` (`common/` unless the feature is genuinely role-specific —
company-wide convention, never co-located inside the feature's own component folder):

- `use<FeatureName>*.ts` — TanStack Query data hook (Zod-validate the payload at the boundary).
  Add its query key as a new member on `src/constants/queryKeys.ts`'s `QueryKey` enum and
  reference it directly (`queryKey: [QueryKey.YOUR_KEY, params]`) — never a per-feature key
  factory. `src/hooks/common/useExampleItems.ts` is the reference shape.

Create the matching thin route wrapper in `src/pages/common/<FeatureName>Page.tsx` (or
`src/pages/<portal>/` for a portal-specific feature) — layout glue (`Seo`, headings) and
route wiring only, no business logic (see `src/pages/README.md`). Wire the route itself per
`AGENTS.md`/`docs/onboarding.md`'s routing walkthrough: role-gated → `ProtectedRoutes.tsx`,
guest-only → `PublicRoutes.tsx`, reachable whether signed in or not (like `ExamplePage`) →
its own hardcoded `<Route>` in `AppRouters.tsx`'s public shell block.

Add any API paths to `src/constants/api-routes.ts` and Zod schemas to `src/schemas/`.
Do not hardcode business logic that belongs to a specific project. Then run `pnpm verify`.
