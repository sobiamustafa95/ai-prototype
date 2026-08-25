# Hooks

Generic, feature-agnostic hooks live here (`useDebouncedValue`, `use*`).
Feature-specific hooks live **inside their feature folder**, not here.

## Rules

- camelCase with a `use` prefix (`useDebouncedValue.ts`).
- Exhaustive `useEffect`/`useCallback` dependencies (ESLint-enforced).
- Unit-tested to ≥80% coverage.
