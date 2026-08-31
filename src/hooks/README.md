# Hooks

Every hook lives under `src/hooks/<concern>/<hookName>.ts` — `<concern>` is the same
naming already used for `src/components/<concern>/`/`src/pages/<concern>/`: `common`
for anything generic or cross-role, or a role name (`admin`, `member`, and any future
portal, e.g. `customer`) for a hook genuinely specific to that role's own pages. There
is no other location for a hook — a feature's own data-fetching hook does **not** live
co-located inside its component folder; it goes here, under `common/` or its role,
exactly like every other hook.

`src/hooks/admin/` and `src/hooks/member/` don't exist yet, and that's expected, not a
gap — no hook in this boilerplate is genuinely role-specific today (every one of them,
generic and feature-specific alike, lives in `common/`). The structure is ready for a
role-specific hook the moment one is actually needed; an empty/missing role folder here
is the same "nothing to see yet" state as `src/components/admin/`/`member/` themselves
(see `AGENTS.md` § Directory Map — those don't physically exist either until a real
role-specific component is added). Don't read an absent `src/hooks/<role>/` as a
mistake or something forgotten.

See `AGENTS.md` § Directory Map for the full "which concern-folder does a new hook go
in" decision.

## Rules

- camelCase with a `use` prefix (`useDebouncedValue.ts`).
- Exhaustive `useEffect`/`useCallback` dependencies (ESLint-enforced).
- Unit-tested to ≥80% coverage.
