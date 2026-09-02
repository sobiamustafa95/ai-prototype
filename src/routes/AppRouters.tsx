import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, createRoutesFromElements, Outlet, Route } from 'react-router-dom';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { AppLayout } from 'src/components/layouts/AppLayout';
import { AuthLayout } from 'src/components/layouts/AuthLayout';
import { RoleLayout } from 'src/components/layouts/RoleLayout';
import { ErrorLayout } from 'src/components/layouts/ErrorLayout';
import { ForbiddenPage } from 'src/pages/common/ForbiddenPage';
import { AuthRedirectRoute } from 'src/routes/AuthRedirectRoute';
import { AuthenticatedRoute } from 'src/routes/AuthenticatedRoute';
import { HomeRedirectRoute } from 'src/routes/HomeRedirectRoute';
import { RoleGuards } from 'src/routes/RoleGuards';
import { PUBLIC_ROUTES } from 'src/routes/PublicRoutes';
import { PROTECTED_ROUTES } from 'src/routes/ProtectedRoutes';
import i18n from 'src/i18n';

// Code-split every feature/page group > 50KB (AGENTS.md § Performance Budget).
// Public routes are lazy-loaded in PublicRoutes.tsx, protected ones in
// ProtectedRoutes.tsx, each next to its own route entry.
const ExamplePage = lazy(() =>
  import('src/pages/common/ExamplePage').then((m) => ({ default: m.ExamplePage }))
);

function withSuspense(element: ReactNode) {
  // Not inside a component render (this builds the module-level `router` object),
  // so this reads the i18next instance directly instead of the useTranslation() hook.
  return <Suspense fallback={<p role="status">{i18n.t('LOADING')}</p>}>{element}</Suspense>;
}

export const router = createBrowserRouter(
  createRoutesFromElements(
    // Wraps every route in NuqsAdapter (docs/adr/url-page-state.md) so any page's
    // useQueryState/useQueryStates calls have router context to read/write search
    // params through — must sit inside the tree RouterProvider renders, not
    // outside it, since it reads router hooks (useSearchParams/useNavigate).
    <Route
      element={
        <NuqsAdapter>
          <Outlet />
        </NuqsAdapter>
      }
    >
      {/* Public shell: 403, and anything reachable whether signed in or not. "/"
          itself is never real content — HomeRedirectRoute always sends a
          visitor on to their role's home route (signed in) or /login (signed
          out); see src/routes/HomeRedirectRoute.tsx. */}
      <Route path="/" element={<AppLayout />} errorElement={<ErrorLayout />}>
        <Route index element={<HomeRedirectRoute />} />
        <Route path="403" element={<ForbiddenPage />} />
        <Route path="example" element={withSuspense(<ExamplePage />)} />
        {/* Catch-all: any unmatched path renders ErrorLayout's "Page not found" branch
            (a loader throw is how the data router produces the 404 Response ErrorLayout
            checks for via isRouteErrorResponse). */}
        <Route
          path="*"
          loader={() => {
            throw new Response('Not Found', { status: 404 });
          }}
        />
      </Route>

      {/* Guest-only auth screens — PublicRoutes.tsx's own array, each wrapped in
          AuthRedirectRoute so an already-authenticated user is bounced to their
          own role's home route instead of seeing the login form again. */}
      <Route element={<AuthLayout />} errorElement={<ErrorLayout />}>
        {PUBLIC_ROUTES.map(({ path, Component }) => (
          <Route
            key={path}
            path={path}
            element={<AuthRedirectRoute component={withSuspense(<Component />)} />}
          />
        ))}
      </Route>

      {/* Every protected page lives here — one shell, each route additionally
          wrapped in RoleGuards with that route's own `roles` from
          ProtectedRoutes.tsx, so a new page is one entry there, not a new route
          group here. AuthenticatedRoute gates the shell itself (not just the
          page) so an unauthenticated visitor deep-linking a protected URL never
          sees a flash of RoleLayout's chrome (sidebar, sign-out button) before
          being redirected — RoleGuards' own auth check still applies per route,
          both reading the same authStore, so neither can drift out of sync. */}
      <Route
        element={
          <AuthenticatedRoute>
            <RoleLayout />
          </AuthenticatedRoute>
        }
        errorElement={<ErrorLayout />}
      >
        {PROTECTED_ROUTES.map(({ path, Component, roles }) => (
          <Route
            key={path}
            // path is absolute (e.g. '/admin/dashboard'); this parent has no
            // path of its own, so the leading slash is stripped for the relative match.
            path={path.slice(1)}
            element={<RoleGuards roles={roles} component={withSuspense(<Component />)} />}
          />
        ))}
      </Route>
    </Route>
  )
);
