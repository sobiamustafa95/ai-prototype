---
name: fe-api-guide
description: Use when integrating a backend into the frontend or when given an OpenAPI/spec file. Generates consolidated API docs, suggested api-routes constants, and Zod schemas from the spec — without inventing endpoints.
---

# Frontend API integration guide

Authoritative conventions: `AGENTS.md` § Data & State.

## Inputs

An OpenAPI/Swagger file, a Postman collection, or a written endpoint list.

## Outputs (write under `docs/api/`)

1. **`docs/api/README.md`** — every endpoint: method, path, auth, params, request/response
   shapes, and error cases, grouped by service area.
2. **Suggested `src/constants/api-routes.ts` entries** — one flat, per-concern TS `enum`
   (e.g. `OrderRoutes`), matching the existing shape (`AuthRoutes`/`ExampleRoutes` in that
   same file) — see `AGENTS.md` § Constant Registries. A real `enum` can't nest, so a new
   service area is its own enum, never a new key nested inside an existing one. A route
   needing a path param stays a plain string member for its static base path (enum members
   can only be string/numeric literals, never functions) — interpolate the param at the call
   site (e.g. `` `${OrderRoutes.DETAIL}/${id}` ``), or add a small colocated helper function
   exported alongside the enum if more than one call site needs the same interpolation. Do
   not overwrite unrelated enums.
3. **Suggested `src/constants/queryKeys.ts` entries** — new members on the global `QueryKey`
   enum for every list/detail endpoint this integration adds a TanStack Query hook for (see
   `AGENTS.md` § Data & State) — never a per-feature key factory, never an inline string
   literal in the hook itself.
4. **Suggested `src/schemas/*.schema.ts`** — Zod schemas for each request/response, with
   inferred TypeScript types, so the query layer can validate payloads at the boundary.
5. **Per-service README** for each major area.

## Rules

- Stay faithful to the spec — never invent endpoints, fields, or status codes.
- Types flow one direction: Zod schema → `z.infer` type. Do not hand-duplicate interfaces.
- All fetching goes through `src/services/api-client.ts` + a TanStack Query hook.
