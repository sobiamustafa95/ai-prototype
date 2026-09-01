/**
 * API routes reachable by every role — the `common` concern, same folder-structure
 * convention as `src/components/common/`/`src/hooks/common/`. One enum per portal/
 * concern, not one enum per feature (AGENTS.md § Constant Registries): a second
 * common-portal feature adds its own member here, it does not get its own enum.
 */
export enum CommonRoutes {
  // Backs src/components/example/ExampleWidget — copy & rename per feature.
  EXAMPLE_ITEMS = '/example-items',
}
