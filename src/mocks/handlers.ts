import { http, HttpResponse } from 'msw';
import { AuthRoutes, ExampleRoutes } from 'src/constants/api-routes';
import { Role } from 'src/routes/roles';
import type { AuthTokens, AuthUser } from 'src/types/auth';
import type { ExampleItem } from 'src/schemas/example.schema';

function buildExampleItems(): ExampleItem[] {
  return Array.from({ length: 42 }, (_, index) => ({
    id: `item-${index + 1}`,
    title: `Example item ${index + 1}`,
    description: `A domain-agnostic placeholder record numbered ${index + 1}.`,
  }));
}

/**
 * Deterministic in-memory dataset so stories/tests behave like a real backend.
 * Mutated in place by the create/update/delete handlers below — a real backend
 * would persist these; this one just needs the in-memory list to actually
 * reflect a mutation on the very next GET, which is what proves a workflow
 * test's invalidation actually refetched instead of merely resolving.
 */
const EXAMPLE_ITEMS: ExampleItem[] = buildExampleItems();

let exampleItemCounter = EXAMPLE_ITEMS.length;

/**
 * Resets the in-memory example-items dataset to its deterministic starting state.
 * A CRUD workflow test that mutates it (create/update/delete) must call this in its
 * own `afterEach` — Vitest isolates test *files* from each other, not individual
 * `it()` blocks within the same file, so a mutation from one test would otherwise
 * leak into the next (see AddExampleItemModal/EditExampleItemModal/
 * DeleteExampleItemButton's own `*.workflow.test.tsx` for the reference usage).
 */
export function resetExampleItems(): void {
  EXAMPLE_ITEMS.length = 0;
  EXAMPLE_ITEMS.push(...buildExampleItems());
  exampleItemCounter = EXAMPLE_ITEMS.length;
}

/**
 * No real backend to assign roles in dev, so mock it by email: an address
 * containing a role's own name (case-insensitive — e.g. admin@geeks.dev logs in
 * as Role.ADMIN) logs in as that role; anything else falls back to Role.MEMBER.
 * Derived generically from `Role`'s actual members, not a hardcoded email
 * pattern per role — adding a role to `roles.ts` makes it reachable here for
 * free, with no matching edit required in this file (AGENTS.md's "adding a role
 * touches exactly three places" promise would otherwise have a silent fourth
 * place: this was previously a hardcoded admin-or-member binary with no path to
 * a third role in local dev). Lets a developer exercise every role locally with
 * zero setup.
 */
function demoUserFor(email: string): AuthUser {
  const lowerEmail = email.toLowerCase();
  const matchedRole = Object.values(Role).find((role) => lowerEmail.includes(role.toLowerCase()));
  return {
    _id: 'user-1',
    name: 'Demo User',
    email,
    phone: '+15555550100',
    role: matchedRole ?? Role.MEMBER,
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
  http.post(AuthRoutes.SIGNUP, async ({ request }) => {
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
  http.post(AuthRoutes.VERIFY_SIGNUP_OTP, async ({ request }) => {
    const { email, otp } = (await request.json()) as { email: string; otp: string };
    // Reserved code for the "invalid/expired OTP" workflow-test scenario — never
    // a real code the backend would actually issue.
    if (otp === '000000') {
      return HttpResponse.json({ message: 'Invalid or expired code.' }, { status: 400 });
    }
    return envelope({ user: demoUserFor(email), tokens: demoTokens() }, 'Account verified.');
  }),
  http.post(AuthRoutes.RESEND_SIGNUP_OTP, () => envelope(true, 'Code resent.')),
  http.post(AuthRoutes.LOGIN, async ({ request }) => {
    const { email, password } = (await request.json()) as { email: string; password: string };
    // Reserved password for the "invalid credentials" workflow-test scenario —
    // never a real password a developer would type while running the app in dev.
    if (password === 'wrongpassword') {
      return HttpResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }
    return envelope(
      { user: demoUserFor(email), tokens: demoTokens() },
      'Your account has been logged in successfully.'
    );
  }),
  // Rotates on every call, mirroring the real backend's refresh-token behavior.
  http.post(AuthRoutes.REFRESH_TOKEN, () => envelope(demoTokens())),
  http.post(AuthRoutes.FORGOT_PASSWORD, async ({ request }) => {
    const { email } = (await request.json()) as { email: string };
    // Reserved address for the "server error" workflow-test scenario — same
    // convention as SIGNUP's 'taken@example.com' above.
    if (email === 'error@example.com') {
      return HttpResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
    return envelope(true, 'Code sent.');
  }),
  http.post(AuthRoutes.VERIFY_FORGOT_PASSWORD_OTP, () =>
    envelope({ resetToken: 'demo-reset-token' })
  ),
  http.post(AuthRoutes.FORGOT_PASSWORD_LINK, () => envelope(true, 'Link sent.')),
  http.post(AuthRoutes.VERIFY_RESET_PASSWORD, async ({ request }) => {
    const { token } = (await request.json()) as { token: string };
    // Reserved token for the "invalid/expired reset token" workflow-test scenario.
    if (token === 'invalid-token') {
      return HttpResponse.json({ message: 'Invalid or expired token.' }, { status: 400 });
    }
    return envelope(true, 'Password reset.');
  }),
  http.post(AuthRoutes.APPLE_CALLBACK, () => envelope({ user: DEMO_USER, tokens: demoTokens() })),
  http.get(AuthRoutes.ME, () => envelope(DEMO_USER)),
  http.post(AuthRoutes.CHANGE_PASSWORD, () => envelope(true, 'Password changed.')),
  http.post(AuthRoutes.LOGOUT, () => new HttpResponse(null, { status: 204 })),
  http.post(AuthRoutes.LOGOUT_ALL_DEVICES, () => new HttpResponse(null, { status: 204 })),
  http.get(AuthRoutes.ACTIVE_SESSIONS, () =>
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
  http.get(ExampleRoutes.LIST, ({ request }) => {
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
  http.post(ExampleRoutes.LIST, async ({ request }) => {
    const { title, description } = (await request.json()) as { title: string; description: string };
    // Reserved title for the "server error" workflow-test scenario — same
    // convention as the list endpoint's '__error__' query above.
    if (title === '__error__') {
      return HttpResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
    exampleItemCounter += 1;
    const created: ExampleItem = { id: `item-${exampleItemCounter}`, title, description };
    EXAMPLE_ITEMS.unshift(created);
    return envelope(created, 'Item created.');
  }),
  http.patch(`${ExampleRoutes.LIST}/:id`, async ({ request, params }) => {
    const { title, description } = (await request.json()) as { title: string; description: string };
    if (title === '__error__') {
      return HttpResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
    const id = String(params['id']);
    const index = EXAMPLE_ITEMS.findIndex((item) => item.id === id);
    if (index === -1) {
      return HttpResponse.json({ message: 'Item not found.' }, { status: 404 });
    }
    const updated: ExampleItem = { id, title, description };
    EXAMPLE_ITEMS[index] = updated;
    return envelope(updated, 'Item updated.');
  }),
  http.delete(`${ExampleRoutes.LIST}/:id`, ({ params }) => {
    const id = String(params['id']);
    // Reserved id for the "server error" workflow-test scenario — never a real
    // generated id (those are always `item-<n>`).
    if (id === '__error__') {
      return HttpResponse.json({ message: 'Internal server error.' }, { status: 500 });
    }
    const index = EXAMPLE_ITEMS.findIndex((item) => item.id === id);
    if (index === -1) {
      return HttpResponse.json({ message: 'Item not found.' }, { status: 404 });
    }
    EXAMPLE_ITEMS.splice(index, 1);
    return envelope(true, 'Item deleted.');
  }),
];
