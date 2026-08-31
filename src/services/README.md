# Services

`api-client.ts` and `queryClient.ts` live directly at `src/services/` root —
cross-cutting infrastructure every concern's service depends on, not a "concern" of
their own (the same reasoning that keeps `src/lib/utils.ts` and `src/constants/`
un-concern-scoped). Everything else — a real API client for one concern — lives under
`src/services/<concern>/`, the same `<concern>`-folder convention already used by
`src/hooks/<concern>/`: `auth/authService.ts` is the one that exists today.

There is no `services/common/` — nothing in `src/components/example/` (this
boilerplate's other reference feature) has service-layer code of its own; its hooks
call `apiClient` directly. Create `services/common/` the moment a real cross-role
service (not infrastructure) is actually needed — same "stays empty until needed"
precedent as `src/hooks/admin/`/`src/hooks/member/`.

## Rules

- One file per external API surface, one typed method per endpoint (see
  `auth/authService.ts`).
- Every call goes through `apiClient` (`src/services/api-client.ts`) — never a raw
  `fetch`/a new axios instance.
- Called only from a `src/hooks/<concern>/` hook (never straight from a
  component/page) — `src/hooks/auth/useAuth.ts` is the reference shape.
- Standalone `*.test.ts`, co-located next to the file, against real MSW handlers
  (never a direct `apiClient`/axios mock) — see `AGENTS.md` § Testing.
