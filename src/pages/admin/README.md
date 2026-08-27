# Admin Role

The `ROLES.ADMIN`-only pages — registered in `src/routes/ProtectedRoutes.tsx`'s
`ADMIN_PROTECTED_ROUTES` (`roles: [ROLES.ADMIN]`, plus `nav` for its sidebar entry — one
array is both the route table and the nav config, no separate file to keep in sync).
Currently one placeholder page, `AdminDashboardPage.tsx`. Replace its content with a real
first admin feature; add more pages to that same array as the role grows.

A user without the `ADMIN` role hitting an admin route is redirected to `/403` by
`RoleGuards` (`src/routes/RoleGuards.tsx`) — nothing else to wire per new admin page.

Every role also sees the common routes (profile/notifications/settings) — those live
in `src/pages/common/` and `src/routes/ProtectedRoutes.tsx`'s `COMMON_PROTECTED_ROUTES`,
not here, since they're shared across every role.
