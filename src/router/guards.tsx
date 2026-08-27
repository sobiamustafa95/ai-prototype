import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from 'src/stores/authStore';

interface RequireAuthProps {
  children: ReactNode;
  /** Where to send unauthenticated users. */
  redirectTo?: string;
}

/**
 * Example route guard. Not wired into any route by default (the boilerplate has
 * no protected areas yet) — wrap a route element with it per project when needed.
 */
export function RequireAuth({ children, redirectTo = '/login' }: RequireAuthProps) {
  const user = useAuthStore((state) => state.user);
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}

interface RequireRoleProps {
  children: ReactNode;
  /** Roles allowed through; the current user's `role` must be one of these. */
  allowedRoles: readonly string[];
  /** Where to send an authenticated-but-wrong-role user (default: home). */
  redirectTo?: string;
}

/**
 * Role-gated route guard — pairs with `RequireAuth` (wrap both, outer-to-inner,
 * when a route needs both authentication and a role check). Every real project
 * we've built ends up with some form of role-segmented routes (admin vs. user
 * areas); this is the generic shape, not wired to any concrete role by default.
 *
 * Example:
 *   <RequireAuth><RequireRole allowedRoles={['admin']}><AdminArea /></RequireRole></RequireAuth>
 */
export function RequireRole({ children, allowedRoles, redirectTo = '/403' }: RequireRoleProps) {
  const role = useAuthStore((state) => state.user?.role);
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}
