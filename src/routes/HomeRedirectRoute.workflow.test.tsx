import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from 'src/test/renderWithProviders';
import { useAuthStore } from 'src/stores/authStore';
import { Role } from 'src/routes/roles';
import { HomeRedirectRoute } from './HomeRedirectRoute';

function MemberDashboardSentinel() {
  return <p>Member dashboard</p>;
}

function LoginPageSentinel() {
  return <h2>Sign in</h2>;
}

function renderAtRoot() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<HomeRedirectRoute />} />
      <Route path="/login" element={<LoginPageSentinel />} />
      <Route path="/member/dashboard" element={<MemberDashboardSentinel />} />
    </Routes>
  );
}

/**
 * Workflow test for the auth-aware "/" route (AGENTS.md's routing table):
 * signed-in visitors go straight to their role's home route (or a dev-facing
 * fallback if that role has none configured); signed-out visitors go to
 * /login. See AuthRedirectRoute.workflow.test.tsx for the mirror-image guest
 * screens' own behavior.
 */
describe('HomeRedirectRoute workflow', () => {
  afterEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      hasHydrated: true,
    });
  });

  it('redirects a signed-out visitor from "/" to /login', () => {
    useAuthStore.setState({ user: null, hasHydrated: true });

    renderAtRoot();

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('redirects a signed-in visitor from "/" straight to their role\'s home route', () => {
    useAuthStore.setState({
      user: {
        _id: '1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        role: Role.MEMBER,
        status: 'active',
      },
      hasHydrated: true,
    });

    renderAtRoot();

    expect(screen.getByText('Member dashboard')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Sign in' })).not.toBeInTheDocument();
  });
});
