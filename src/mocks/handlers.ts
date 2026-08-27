import { http, HttpResponse } from 'msw';
import { API_ROUTES } from 'src/constants/api-routes';
import { ROLES } from 'src/routes/roles';
import type { AuthTokens, AuthUser } from 'src/types';
import type { ExampleItem } from 'src/schemas/example.schema';

/** Deterministic in-memory dataset so stories/tests behave like a real backend. */
const EXAMPLE_ITEMS: ExampleItem[] = Array.from({ length: 42 }, (_, index) => ({
  id: `item-${index + 1}`,
  title: `Example item ${index + 1}`,
  description: `A domain-agnostic placeholder record numbered ${index + 1}.`,
}));

/**
 * No real backend to assign roles in dev, so mock it by email: an address
 * containing "admin" (e.g. admin@geeks.dev) logs in as ROLES.ADMIN and lands on
 * /admin/dashboard; any other email is ROLES.MEMBER on /member/dashboard. Lets a
 * developer exercise every role locally with zero setup.
 */
function demoUserFor(email: string): AuthUser {
  return {
    _id: 'user-1',
    name: 'Demo User',
    email,
    phone: '+15555550100',
    role: email.includes('admin') ? ROLES.ADMIN : ROLES.MEMBER,
    status: 'ACTIVE',
  };
}

const DEMO_USER = demoUserFor('demo@geeks.dev');

let refreshCounter = 0;
function demoTokens(): AuthTokens {
  refreshCounter += 1;
  return {
    accessToken: `demo-access-token-${refreshCounter}`,
    refreshToken: `demo-refresh-token-${refreshCounter}`,
    expiresIn: '15m',
    refreshExpiresIn: '60d',
  };
}

/** Wraps a payload in the real backend's success envelope: `{ data, status, message }`. */
function envelope(data: unknown, message = 'Success.') {
  return HttpResponse.json({ data, status: 200, message });
}

export const handlers = [
  // ---- Auth ----
  http.post(API_ROUTES.AUTH.SIGNUP, async ({ request }) => {
    const { email } = (await request.json()) as { email: string };
    // Reserved address for the "email already registered" workflow-test scenario
    // — never a real signup a developer would type while running the app in dev.
    if (email === 'taken@example.com') {
      return HttpResponse.json(
        { message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }
    return envelope(true, 'Account created.');
  }),
  http.post(API_ROUTES.AUTH.VERIFY_SIGNUP_OTP, async ({ request }) => {
    const { email } = (await request.json()) as { email: string };
    return envelope({ user: demoUserFor(email), tokens: demoTokens() }, 'Account verified.');
  }),
  http.post(API_ROUTES.AUTH.RESEND_SIGNUP_OTP, () => envelope(true, 'Code resent.')),
  http.post(API_ROUTES.AUTH.LOGIN, async ({ request }) => {
    const { email } = (await request.json()) as { email: string };
    return envelope(
      { user: demoUserFor(email), tokens: demoTokens() },
      'Your account has been logged in successfully.'
    );
  }),
  // Rotates on every call, mirroring the real backend's refresh-token behavior.
  http.post(API_ROUTES.AUTH.REFRESH_TOKEN, () => envelope(demoTokens())),
  http.post(API_ROUTES.AUTH.FORGOT_PASSWORD, () => envelope(true, 'Code sent.')),
  http.post(API_ROUTES.AUTH.VERIFY_FORGOT_PASSWORD_OTP, () =>
    envelope({ resetToken: 'demo-reset-token' })
  ),
  http.post(API_ROUTES.AUTH.FORGOT_PASSWORD_LINK, () => envelope(true, 'Link sent.')),
  http.post(API_ROUTES.AUTH.VERIFY_RESET_PASSWORD, () => envelope(true, 'Password reset.')),
  http.post(API_ROUTES.AUTH.APPLE_CALLBACK, () =>
    envelope({ user: DEMO_USER, tokens: demoTokens() })
  ),
  http.get(API_ROUTES.AUTH.ME, () => envelope(DEMO_USER)),
  http.post(API_ROUTES.AUTH.CHANGE_PASSWORD, () => envelope(true, 'Password changed.')),
  http.post(API_ROUTES.AUTH.LOGOUT, () => new HttpResponse(null, { status: 204 })),
  http.post(API_ROUTES.AUTH.LOGOUT_ALL_DEVICES, () => new HttpResponse(null, { status: 204 })),
  http.get(API_ROUTES.AUTH.ACTIVE_SESSIONS, () =>
    envelope([
      {
        _id: 'session-1',
        deviceInfo: 'Chrome on macOS',
        ipAddress: '127.0.0.1',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ])
  ),

  // ---- Example feature: paginated + searchable list ----
  http.get(API_ROUTES.EXAMPLE.LIST, ({ request }) => {
    const url = new URL(request.url);
    const query = (url.searchParams.get('q') ?? '').toLowerCase();
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');

    // Reserved query for the "server error" workflow-test scenario — never a
    // real search term a user would type.
    if (query === '__error__') {
      return HttpResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }

    const filtered = query
      ? EXAMPLE_ITEMS.filter((item) => item.title.toLowerCase().includes(query))
      : EXAMPLE_ITEMS;

    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return envelope({ items, page, pageSize, total: filtered.length });
  }),
];
