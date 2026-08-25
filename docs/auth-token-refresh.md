# Optional pattern: silent single-flight token refresh

**Status: not implemented by default.** `src/services/api-client.ts` hard-logs-out on a
401 (clears the auth store, lets the router redirect via `RequireAuth`). This is what
three of our four real projects do in production (CarnectionIQ, Glow-Tech, Solar-lead all
just end the session on 401 — none of them implement a working refresh flow). Only
`glassatecture-fe` (a Next.js project) has one, and its implementation is solid enough to
document here as a reference for the rare project that actually needs it (e.g. a long-lived
session product where forcing a re-login on every access-token expiry would hurt UX).

## Why hard-logout is the default

- It's what actually ships in most of our projects — the boilerplate should match reality,
  not aspire past it.
- A refresh flow adds real complexity (single-flight coordination, a request queue, retry
  wiring, more surface for auth bugs) that isn't worth carrying by default in a
  domain-agnostic starting point.
- If a project needs it, the pattern below is a complete, working reference — copy it in
  deliberately rather than inheriting unused complexity everywhere else.

## The pattern (adapted from `glassatecture-fe`)

1. **Single-flight guard.** A module-level `isRefreshing` flag plus a queue of pending
   callbacks, so concurrent 401s don't each trigger their own refresh call:

   ```ts
   let isRefreshing = false;
   let pendingQueue: Array<(token: string | null) => void> = [];

   function subscribeToRefresh(callback: (token: string | null) => void) {
     pendingQueue.push(callback);
   }

   function resolveQueue(token: string | null) {
     pendingQueue.forEach((callback) => callback(token));
     pendingQueue = [];
   }
   ```

2. **Response interceptor** — the first 401 kicks off the refresh; any 401 that arrives
   while a refresh is already in flight just queues its retry instead of firing a second
   refresh request:

   ```ts
   apiClient.interceptors.response.use(
     (response) => response,
     async (error: AxiosError) => {
       const original = error.config as
         (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
       if (error.response?.status !== 401 || !original || original._retry) {
         return Promise.reject(normalizeError(error));
       }
       original._retry = true;

       if (isRefreshing) {
         return new Promise((resolve, reject) => {
           subscribeToRefresh((token) => {
             if (!token) return reject(normalizeError(error));
             original.headers.set('Authorization', `Bearer ${token}`);
             resolve(apiClient(original));
           });
         });
       }

       isRefreshing = true;
       try {
         const token = await requestRefresh(); // POST /auth/refresh, write to authStore
         resolveQueue(token);
         if (!token) return Promise.reject(normalizeError(error));
         original.headers.set('Authorization', `Bearer ${token}`);
         return apiClient(original);
       } finally {
         isRefreshing = false;
       }
     }
   );
   ```

3. **Exclude auth-flow routes** (login/signup/refresh itself) from triggering a refresh —
   a 401 on `/auth/login` means "wrong password," not "token expired."

4. **Force-logout on refresh failure** — if `requestRefresh()` comes back empty, clear the
   auth store and redirect, exactly like the hard-logout default does today.

## Adapting it into this boilerplate

- Write `token` through `useAuthStore.getState().setToken(...)` (already exposed on the
  store, see `src/stores/authStore.ts`), not a bare localStorage write.
- Keep the queue/flag module-private to `api-client.ts` — don't put it in a store.
- Verify it by hand: trigger two requests that 401 at nearly the same time and confirm
  `requestRefresh()` only fires once (log it, or watch the network tab) — this boilerplate
  has no automated test framework to assert it for you.
