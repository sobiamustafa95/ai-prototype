<!-- AUTO-GENERATED from .claude/commands — edit the source, then run `npm run sync:ai`. -->

Run a performance audit. Scope: $ARGUMENTS

There's no size-limit budget gate in this boilerplate — check performance directly:

1. `npm run build` — read the per-chunk gzip sizes Vite prints; flag anything surprisingly
   large for what it does, and any chunk > 50KB that isn't already lazy-loaded (see
   `router.tsx`'s `lazy()` pattern for how to split it).
2. `npx react-doctor --category Performance <path>` — React Doctor's dedicated performance
   category (unnecessary re-renders, missing memoization, effect/state anti-patterns).
3. Flag likely re-render hazards by eye too: inline objects/functions passed as props,
   missing `useMemo`/`useCallback` where a child is expensive.
4. Report findings with concrete fixes; do not change behavior without explaining it.
