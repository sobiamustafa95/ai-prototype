import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from 'src/components/layouts/AppLayout';
import { AuthLayout } from 'src/components/layouts/AuthLayout';
import { DashboardLayout } from 'src/components/layouts/DashboardLayout';
import { ErrorLayout } from 'src/components/layouts/ErrorLayout';
import { HomeRoute } from 'src/router/HomeRoute';
import { DashboardRoute } from 'src/router/DashboardRoute';
import { ForbiddenRoute } from 'src/router/ForbiddenRoute';
import { RequireAuth } from 'src/router/guards';
import i18n from 'src/i18n';

// Code-split every feature/page group > 50KB (AGENTS.md § Performance Budget).
const ExampleWidget = lazy(() =>
  import('src/components/features/ExampleWidget/ExampleWidget').then((module) => ({
    default: module.ExampleWidget,
  }))
);
const LoginPage = lazy(() =>
  import('src/components/features/Auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const SignupPage = lazy(() =>
  import('src/components/features/Auth/SignupPage').then((m) => ({ default: m.SignupPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('src/components/features/Auth/ForgotPasswordPage').then((m) => ({
    default: m.ForgotPasswordPage,
  }))
);
const VerifyOtpPage = lazy(() =>
  import('src/components/features/Auth/VerifyOtpPage').then((m) => ({ default: m.VerifyOtpPage }))
);
const ResetPasswordPage = lazy(() =>
  import('src/components/features/Auth/ResetPasswordPage').then((m) => ({
    default: m.ResetPasswordPage,
  }))
);

function withSuspense(element: ReactNode) {
  // Not inside a component render (this builds the module-level `router` object),
  // so this reads the i18next instance directly instead of the useTranslation() hook.
  return <Suspense fallback={<p role="status">{i18n.t('LOADING')}</p>}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorLayout />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: '403', element: <ForbiddenRoute /> },
      { path: 'example', element: withSuspense(<ExampleWidget />) },
      // Catch-all: any unmatched path renders ErrorLayout's "Page not found" branch
      // (a loader throw is how the data router produces the 404 Response ErrorLayout
      // checks for via isRouteErrorResponse).
      {
        path: '*',
        loader: () => {
          throw new Response('Not Found', { status: 404 });
        },
      },
    ],
  },
  {
    element: <AuthLayout />,
    errorElement: <ErrorLayout />,
    children: [
      { path: 'login', element: withSuspense(<LoginPage />) },
      { path: 'signup', element: withSuspense(<SignupPage />) },
      { path: 'forgot-password', element: withSuspense(<ForgotPasswordPage />) },
      { path: 'verify-otp', element: withSuspense(<VerifyOtpPage />) },
      { path: 'reset-password', element: withSuspense(<ResetPasswordPage />) },
    ],
  },
  {
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    errorElement: <ErrorLayout />,
    children: [{ path: 'dashboard', element: <DashboardRoute /> }],
  },
]);
