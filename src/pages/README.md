# Pages

One file per route. A page is thin: layout glue (`Seo`, headings, footer links),
route-only concerns (`location.state`, search params, `navigate`) — the actual form/UI
logic lives in the matching `src/components/<concern>/` folder.

## Directory Structure

- `common/` — pages reachable by every role: `HomePage`, `ForbiddenPage`, `ExamplePage`,
  and the "common route" placeholders every role's sidebar links to —
  `SettingsPage`/`ProfilePage`/`NotificationsPage` (`roles: 'all'` in
  `src/routes/ProtectedRoutes.tsx`'s `COMMON_PROTECTED_ROUTES`).
- `auth/` — the Auth feature's five pages (login/signup/forgot-password/verify/reset),
  each pairing with the matching form in `src/components/auth/` — see that folder's
  README for the full flow.
- `<role>/` — pages owned by one role (see `src/routes/ProtectedRoutes.tsx` § the role
  system). Ships with two examples, both single placeholder pages: `member/`
  (`ROLES.MEMBER`) and `admin/` (`ROLES.ADMIN`). Add a new role by adding it to
  `src/routes/roles.ts`, its routes to `ProtectedRoutes.tsx`, its sidebar variant to that
  same file's `ROLE_LAYOUT`, then a folder here of the same name — no router, guard, or
  layout code changes needed.

## Rule

A page never duplicates its component's logic — it wires props/callbacks and handles
routing. If a "page" starts holding real form state or business logic, that logic
belongs in `src/components/<concern>/` instead.

See `AGENTS.md` and `src/components/README.md` for the full, authoritative rule set.
