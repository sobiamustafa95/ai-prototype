<!-- AUTO-GENERATED from .claude/commands — edit the source, then run `npm run sync:ai`. -->

Generate frontend API integration documentation for the spec at: $ARGUMENTS

Follow the `fe-api-guide` skill in `.claude/skills/fe-api-guide/SKILL.md`.

Produce, under `docs/api/`:

1. A consolidated Markdown reference of every endpoint (method, path, params, request/response types).
2. Suggested `src/constants/api-routes.ts` entries and `src/schemas/*` Zod contracts.
3. A per-module README for each backend service area.

Keep everything domain-accurate to the provided spec. Do not invent endpoints.
