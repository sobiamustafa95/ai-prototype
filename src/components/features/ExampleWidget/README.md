# ExampleWidget Feature

The single, deliberately generic example feature. It proves the boilerplate's
patterns end-to-end without introducing any business domain. **Copy this folder,
rename it, and replace the logic** to start a real feature.

## What it does

Renders a paginated, searchable list of placeholder records. Users can type a
query and page through results. Everything is keyboard- and screen-reader-accessible.

## Key components

- `ExampleWidget.tsx` — the feature component (typed props, search form, list, pagination).
- `useExampleItems.ts` — TanStack Query hook; fetches + Zod-validates the list at the boundary.
- `exampleWidgetStore.ts` — feature-scoped Zustand store for `query` / `page` UI state.

## State approach

- **Server state:** TanStack Query (`useExampleItems`) — never a raw `useEffect` fetch.
- **Client/UI state:** a feature-scoped Zustand store (`useExampleWidgetStore`).
- **Form state:** React Hook Form + Zod (`exampleSearchSchema`).

## API dependency

- `GET /api/v1/example-items?q=&page=&pageSize=` — mocked by MSW (`src/mocks/handlers.ts`).
