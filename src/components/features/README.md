# Features

This directory holds feature folders. It ships with **exactly one** example,
`ExampleWidget/`, which demonstrates every convention at once.

## Starting a new feature

1. Copy `ExampleWidget/` and rename it (e.g. `Invoices/`).
2. Gut the business logic; keep the shape:
   - `Feature.tsx` — component (typed props, TanStack Query, Zustand for UI state, RHF+Zod).
   - `README.md` — required (what it does, components, state, API dependency).
3. Do **not** invent a new folder shape.

Nothing domain-specific belongs in the boilerplate — new features live in project repos.
