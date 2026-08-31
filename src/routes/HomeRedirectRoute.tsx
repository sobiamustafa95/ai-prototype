import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from 'src/stores/authStore';
import { Seo } from 'src/components/common/Seo';
import { AuthenticatedRoute } from 'src/routes/AuthenticatedRoute';
import { getHomeRouteForRole, hasHomeRouteForRole } from 'src/routes/ProtectedRoutes';

/**
 * The signed-in-only half of `HomeRedirectRoute` below — reads the role and
 * decides between an instant redirect to its home route and the dev-facing
 * fallback message. Split out so `AuthenticatedRoute` owns the "not signed in"
 * branch entirely (see `HomeRedirectRoute`) rather than this file re-deciding
 * that too.
 */
function SignedInHomeRedirect() {
  const role = useAuthStore((state) => state.user?.role);
  const { t } = useTranslation();

  if (role !== undefined && hasHomeRouteForRole(role)) {
    return <Navigate to={getHomeRouteForRole(role)} replace />;
  }

  // Genuinely-unconfigured-role state — signed in, but ProtectedRoutes.tsx has
  // no nav-eligible route for this role yet. Rare in a fully-built-out project
  // (every shipped role has one), but common mid-build if auth gets wired up
  // before roles/dashboards do — surfacing this clearly instead of silently
  // bouncing to /login (which used to be `getHomeRouteForRole`'s own fallback
  // for this exact case) is the whole point of this component existing.
  return (
    <section aria-labelledby="no-home-route-heading" className="flex flex-col gap-2">
      <Seo title={t('NO_HOME_ROUTE_TITLE')} />
      <h1 id="no-home-route-heading" className="text-foreground text-2xl font-semibold">
        {t('NO_HOME_ROUTE_TITLE')}
      </h1>
      <p role="alert" className="text-foreground-muted max-w-prose">
        {t('NO_HOME_ROUTE_BODY')}
      </p>
      <p className="text-foreground-muted text-sm">
        {t('NO_HOME_ROUTE_SIGNED_IN_AS')} <code className="font-mono">{role}</code>
      </p>
    </section>
  );
}

/**
 * The "/" route's own content — never real content, always a redirect: a
 * signed-in user goes straight to their role's home route (or the dev-facing
 * fallback above, if that role genuinely has none configured yet), a
 * signed-out user goes to `/login`. The signed-out branch is entirely
 * `AuthenticatedRoute`'s own job (same `hasHydrated` wait + redirect-to-`/login`
 * it already does for every protected route) — this component only adds the
 * signed-in decision on top, not a second auth-check implementation.
 */
export function HomeRedirectRoute() {
  return (
    <AuthenticatedRoute redirectTo="/login">
      <SignedInHomeRedirect />
    </AuthenticatedRoute>
  );
}
