import { http, HttpResponse } from 'msw';
import { API_ROUTES } from 'src/constants/api-routes';
import type { ExampleItem } from 'src/schemas/example.schema';

/** Deterministic in-memory dataset so stories/tests behave like a real backend. */
const EXAMPLE_ITEMS: ExampleItem[] = Array.from({ length: 42 }, (_, index) => ({
  id: `item-${index + 1}`,
  title: `Example item ${index + 1}`,
  description: `A domain-agnostic placeholder record numbered ${index + 1}.`,
}));

const DEMO_USER = { id: 'user-1', name: 'Demo User', email: 'demo@geeks.dev', role: 'admin' };

export const handlers = [
  // ---- Auth stub ----
  http.post(API_ROUTES.AUTH.LOGIN, () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        user: DEMO_USER,
        tokens: { accessToken: 'demo-access-token', refreshToken: 'demo-refresh-token' },
      },
    });
  }),
  http.post(API_ROUTES.AUTH.LOGOUT, () => new HttpResponse(null, { status: 204 })),
  http.post(API_ROUTES.AUTH.REFRESH, () =>
    HttpResponse.json({ accessToken: 'demo-access-token-refreshed' })
  ),
  http.get(API_ROUTES.AUTH.ME, () => HttpResponse.json({ status: 'success', data: DEMO_USER })),
  http.post(API_ROUTES.AUTH.SIGNUP, () => HttpResponse.json({ status: 'success', data: null })),
  http.post(API_ROUTES.AUTH.VERIFY_OTP, () =>
    HttpResponse.json({
      status: 'success',
      data: {
        user: DEMO_USER,
        tokens: { accessToken: 'demo-access-token', refreshToken: 'demo-refresh-token' },
      },
    })
  ),
  http.post(API_ROUTES.AUTH.RESEND_OTP, () => HttpResponse.json({ status: 'success', data: null })),
  http.post(API_ROUTES.AUTH.FORGOT_PASSWORD, () =>
    HttpResponse.json({ status: 'success', data: null })
  ),
  http.post(API_ROUTES.AUTH.RESET_PASSWORD, () =>
    HttpResponse.json({ status: 'success', data: null })
  ),

  // ---- Example feature: paginated + searchable list ----
  http.get(API_ROUTES.EXAMPLE.LIST, ({ request }) => {
    const url = new URL(request.url);
    const query = (url.searchParams.get('q') ?? '').toLowerCase();
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');

    const filtered = query
      ? EXAMPLE_ITEMS.filter((item) => item.title.toLowerCase().includes(query))
      : EXAMPLE_ITEMS;

    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      status: 'success',
      data: { items, page, pageSize, total: filtered.length },
    });
  }),
];
