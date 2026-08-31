# Member Role

The `Role.MEMBER`-only pages — registered in `src/routes/ProtectedRoutes.tsx`'s
`MEMBER_PROTECTED_ROUTES` (`roles: [Role.MEMBER]`, plus `nav` for its sidebar entry — one
array is both the route table and the nav config, no separate file to keep in sync).
Currently one placeholder page, `DashboardPage.tsx`. Replace its content with a real first
feature; add more pages to that same array as the role grows.

Every role also sees the common routes (profile/notifications/settings) — those live
in `src/pages/common/` and `src/routes/ProtectedRoutes.tsx`'s `COMMON_PROTECTED_ROUTES`,
not here, since they're shared across every role.
