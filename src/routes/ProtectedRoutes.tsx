import { lazy, type ComponentType } from 'react';
import type { TranslationKey } from 'src/i18n';
import { Role } from 'src/routes/roles';

/**
 * The single registry of every protected page: which roles may reach it, and
 * (optionally) its sidebar nav entry. Read by two places: `AppRouters.tsx`
 * generates every protected `<Route>` from `PROTECTED_ROUTES`, wrapping each
 * one in `RoleGuards` (`src/routes/RoleGuards.tsx`) with that route's own
 * `roles`; `RoleLayout` (`src/components/layouts/RoleLayout.tsx`) calls
 * `getNavItemsForRole`/`getRoleLayout` below for the signed-in user's sidebar
 * + shell. A role can reach a route only if it's in that route's own `roles`
 * list or the route is `'all'` ("common," shown to every role — settings/
 * profile/notifications).
 *
 * Adding a role end-to-end touches exactly three places, in this order:
 * 1. `src/routes/roles.ts` — add the `Role` member.
 * 2. This file — add that role's own routes (`roles: [Role.X]`, each with
 *    `nav: { labelKey, end? }` if it should show in the sidebar), and its
 *    entry in `ROLE_LAYOUT` below (reuse `variant: 'sidebar'` unless it needs
 *    a visually different shell — see `RoleLayoutVariant`).
 * 3. `src/pages/<role>/` — that role's own pages.
 * No router, guard, or layout code needs to change — all of it reads this file.
 */
export interface ProtectedRoute {
  /** Absolute path, e.g. '/member/dashboard' or '/settings'. */
  path: string;
  Component: ComponentType;
  /** Roles that may reach this route; 'all' = every authenticated role (common). */
  roles: readonly Role[] | 'all';
  /**
   * Present only for a route that should appear in the sidebar — a route
   * without it (e.g. a detail page reached by clicking into a list) is simply
   * never rendered in the sidebar, no separate flag needed.
   */
  nav?: {
    labelKey: TranslationKey;
    /** Passed through to `NavLink`'s `end` — exact-match highlighting for index-like routes. */
    end?: boolean;
  };
}

// Lazy per-page — code-split every page > 50KB (AGENTS.md § Performance Budget).
// AppRouters.tsx wraps every one of these in <Suspense>.
const MemberDashboardPage = lazy(() =>
  import('src/pages/member/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const AdminDashboardPage = lazy(() =>
  import('src/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const ProfilePage = lazy(() =>
  import('src/pages/common/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const NotificationsPage = lazy(() =>
  import('src/pages/common/NotificationsPage').then((m) => ({ default: m.NotificationsPage }))
);
const SettingsPage = lazy(() =>
  import('src/pages/common/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

/** `Role.MEMBER`'s own routes. */
export const MEMBER_PROTECTED_ROUTES: readonly ProtectedRoute[] = [
  {
    path: '/member/dashboard',
    Component: MemberDashboardPage,
    roles: [Role.MEMBER],
    nav: { labelKey: 'NAV_DASHBOARD', end: true },
  },
];

/** `Role.ADMIN`'s own routes. */
export const ADMIN_PROTECTED_ROUTES: readonly ProtectedRoute[] = [
  {
    path: '/admin/dashboard',
    Component: AdminDashboardPage,
    roles: [Role.ADMIN],
    nav: { labelKey: 'NAV_ADMIN_DASHBOARD', end: true },
  },
];

/**
 * Routes every role shares (`roles: 'all'`). Registered once here instead of
 * copy-pasted into every role's own list above, a common route automatically
 * shows up in every role's sidebar too — see `getNavItemsForRole` below.
 */
export const COMMON_PROTECTED_ROUTES: readonly ProtectedRoute[] = [
  { path: '/profile', Component: ProfilePage, roles: 'all', nav: { labelKey: 'NAV_PROFILE' } },
  {
    path: '/notifications',
    Component: NotificationsPage,
    roles: 'all',
    nav: { labelKey: 'NAV_NOTIFICATIONS' },
  },
  { path: '/settings', Component: SettingsPage, roles: 'all', nav: { labelKey: 'NAV_SETTINGS' } },
];

/** Every protected route — what `AppRouters.tsx` generates every protected `<Route>` from. */
export const PROTECTED_ROUTES: readonly ProtectedRoute[] = [
  ...MEMBER_PROTECTED_ROUTES,
  ...ADMIN_PROTECTED_ROUTES,
  ...COMMON_PROTECTED_ROUTES,
];

function isRouteAllowedForRole(role: string, route: ProtectedRoute): boolean {
  // `role` is an unvalidated string from the backend/auth store (see AuthUser.role
  // in src/types/index.ts) — the cast mirrors `isRole` below, comparing it against
  // the closed `Role` set without widening `route.roles`' own element type to `string`.
  return route.roles === 'all' || route.roles.some((allowed) => allowed === (role as Role));
}

function hasNav(
  route: ProtectedRoute
): route is ProtectedRoute & { nav: NonNullable<ProtectedRoute['nav']> } {
  return route.nav !== undefined;
}

export interface NavItem {
  to: string;
  labelKey: TranslationKey;
  // `| undefined`, not just `?`, because it's built straight from
  // `route.nav.end`, itself `boolean | undefined` (see ProtectedRoute.nav below).
  end?: boolean | undefined;
}

/** The current role's own nav-eligible routes + the common ones, in registry order. */
export function getNavItemsForRole(role: string | undefined): NavItem[] {
  if (!role) return [];
  return PROTECTED_ROUTES.filter(
    (route): route is ProtectedRoute & { nav: NonNullable<ProtectedRoute['nav']> } =>
      hasNav(route) && isRouteAllowedForRole(role, route)
  ).map((route) => ({ to: route.path, labelKey: route.nav.labelKey, end: route.nav.end }));
}

const DEFAULT_HOME_ROUTE = '/login';

function findHomeRoute(role: string): ProtectedRoute | undefined {
  return PROTECTED_ROUTES.filter(hasNav).find((route) => isRouteAllowedForRole(role, route));
}

/**
 * Where a role lands after login/verify, or when `AuthRedirectRoute` bounces an
 * already-authenticated user off `/login` — the first nav-eligible route
 * (registry order) that role can reach, so a role's home page is just
 * "whichever of its own routes is listed first," not a separately maintained
 * role→route map.
 */
export function getHomeRouteForRole(role: string | undefined): string {
  if (!role) return DEFAULT_HOME_ROUTE;
  return findHomeRoute(role)?.path ?? DEFAULT_HOME_ROUTE;
}

/**
 * Whether `role` actually has a nav-eligible route registered — lets a caller
 * (`src/routes/HomeRedirectRoute.tsx`) distinguish "genuinely nothing configured
 * for this role yet" from `getHomeRouteForRole`'s own `DEFAULT_HOME_ROUTE`
 * fallback, which exists for the "no role at all" (unauthenticated) case, not
 * as a signal that a signed-in role is unconfigured.
 */
export function hasHomeRouteForRole(role: string | undefined): boolean {
  return role !== undefined && findHomeRoute(role) !== undefined;
}

export type RoleLayoutVariant = 'sidebar';

export interface RoleLayoutConfig {
  /**
   * Which shell design `RoleLayout` (src/components/layouts/RoleLayout.tsx)
   * renders for this role. Two roles can point at the same variant (as both
   * example roles do today) or a new role can introduce a new variant — add
   * the new value to `RoleLayoutVariant` and a matching case in `RoleLayout`.
   */
  variant: RoleLayoutVariant;
  /** Resolved via t() for the shell's header — differs per role so it visibly changes. */
  titleKey: TranslationKey;
}

const ROLE_LAYOUT: Record<Role, RoleLayoutConfig> = {
  [Role.MEMBER]: { variant: 'sidebar', titleKey: 'PORTAL_MEMBER_TITLE' },
  [Role.ADMIN]: { variant: 'sidebar', titleKey: 'PORTAL_ADMIN_TITLE' },
};

const DEFAULT_ROLE_LAYOUT: RoleLayoutConfig = { variant: 'sidebar', titleKey: 'APP_NAME' };

function isRole(value: string): value is Role {
  return Object.values(Role).includes(value as Role);
}

export function getRoleLayout(role: string | undefined): RoleLayoutConfig {
  return role !== undefined && isRole(role) ? ROLE_LAYOUT[role] : DEFAULT_ROLE_LAYOUT;
}
