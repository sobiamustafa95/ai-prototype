/**
 * Centralized registry of every TanStack Query key used across the app — one
 * flat, named entry per distinct query concern, referenced directly in a
 * feature's `queryKey` array (see `src/hooks/common/useExampleItems.ts`).
 * Global on purpose, unlike the per-portal API-route enums (`src/constants/auth.ts`,
 * `common.ts`, and one file per portal/concern beyond that as they're added): it keeps
 * every cache entry the app can produce visible in one place, so a naming collision
 * between two features' keys fails at compile time instead of silently colliding at
 * runtime. Adding a new query starts with an entry here, not an inline string literal
 * or a per-feature key factory.
 */
export enum QueryKey {
  // Backs src/components/example/ExampleWidget — copy & rename per feature.
  EXAMPLE_LIST = 'example-list',
}
