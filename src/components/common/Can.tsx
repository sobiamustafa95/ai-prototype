import type { ReactNode } from 'react';
import { useAuthStore } from 'src/stores/authStore';

interface CanProps {
  /** Roles that may see `children`. */
  allowedRoles: readonly string[];
  children: ReactNode;
  /** Rendered instead when the current user's role isn't in `allowedRoles`. */
  fallback?: ReactNode;
}

/**
 * Inline UI-level permission gate — complements the route-level `RequireRole`
 * guard (`src/router/guards.tsx`) for hiding/showing a piece of UI *within* an
 * already-rendered page, rather than blocking the whole route.
 */
export function Can({ allowedRoles, children, fallback = null }: CanProps) {
  const role = useAuthStore((state) => state.user?.role);
  if (!role || !allowedRoles.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
