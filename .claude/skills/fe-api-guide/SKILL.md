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
2. **Suggested `src/constants/api-routes.ts` entries** — grouped route objects (functions for
   path params), matching the existing shape. Do not overwrite unrelated groups.
3. **Suggested `src/schemas/*.schema.ts`** — Zod schemas for each request/response, with
   inferred TypeScript types, so the query layer can validate payloads at the boundary.
4. **Per-service README** for each major area.

## Rules

- Stay faithful to the spec — never invent endpoints, fields, or status codes.
- Types flow one direction: Zod schema → `z.infer` type. Do not hand-duplicate interfaces.
- All fetching goes through `src/services/api-client.ts` + a TanStack Query hook.
