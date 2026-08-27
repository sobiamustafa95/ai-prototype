# Auth Feature

The "day one" auth screens every real project needs before its first real feature —
login, signup, forgot-password, OTP verification, and password reset. Adapted (not
copied) from a reference boilerplate's auth flow to this stack: React Router v7 data
router, Zustand `persist`, TanStack Query mutations, RHF + Zod, and the Radix/CVA
common component layer.

## What it does

Five pages, each a thin wrapper (`Seo` + heading + form + footer links) around a form:

- `LoginPage` / `LoginForm` — email + password, goes through `authStore.login`
  (matches the existing login pattern already wired to the auth store).
- `SignupPage` / `SignupForm` — name + email + password + confirm, creates the
  account then redirects to `/verify-otp` with the email in router state.
- `ForgotPasswordPage` / `ForgotPasswordForm` — email only, triggers a reset code,
  redirects to `/reset-password` with the email in router state.
- `VerifyOtpPage` / `OtpForm` — 6-digit code; completes signup by starting a session
  (`authStore.setSession`). Redirects to `/signup` if hit directly with no email in
  state (can't verify without knowing which email).
- `ResetPasswordPage` / `ResetPasswordForm` — email + code + new password + confirm,
  **self-contained** (email/code entered on the page, not carried via a separate
  session-stored "purpose" the way the reference repo does it) — fewer moving parts
  for a domain-agnostic stub project teams can extend per their own backend's flow.

## State approach

- **Server state:** TanStack Query `useMutation` for signup/OTP/forgot/reset (one-off
  actions, not persisted state). Login/logout stay on `authStore` directly since that
  already represents persisted session state.
- **Client/session state:** `src/stores/authStore.ts` (`persist`-backed) — `token`
  and `user` are the single source of truth; `api-client.ts` reads from it directly.
- **Form state:** React Hook Form + Zod (`src/schemas/auth.schema.ts`), composed from
  `src/schemas/common.schema.ts` primitives (email/password).

## API dependency

`src/constants/api-routes.ts` § `AUTH` — mocked by MSW (`src/mocks/handlers.ts`).
Swap the handlers for real endpoints per project; the request/response shapes in
`src/services/authService.ts` are the contract to match.

## Token handling (already wired, works with a real backend as-is)

This isn't a stub to build later — `src/services/api-client.ts` already implements the
full JWT bearer-token flow, and nothing about it changes when MSW is replaced with a
real backend:

- **Attach:** every outgoing request reads `useAuthStore.getState().token` and sets
  `Authorization: Bearer <token>` via an Axios request interceptor — never read/write
  the token from a component or `localStorage` directly.
- **Persist:** `authStore.ts` is `zustand/persist`-backed, so the token (and `user`)
  survive a page reload without any extra code.
- **Expiry (default):** a response interceptor hard-logs-out on any `401` — clears the
  store, `RequireAuth` (`src/router/guards.tsx`) redirects to `/login`. No silent
  refresh by default; this matches what most of our real projects actually ship.
- **Expiry (opt-in):** if a project needs silent token refresh instead of forcing
  re-login on every access-token expiry, `docs/auth-token-refresh.md` has a complete,
  working single-flight refresh pattern to copy in — deliberately not the default,
  since it adds real complexity (queueing, retry wiring) most projects don't need.

**What actually changes when the real backend arrives:** only `src/mocks/handlers.ts`
(delete/disable the MSW mocks) and, if the backend's token shape differs, the response
mapping inside `src/services/authService.ts`. `authStore.ts`, `api-client.ts`, and every
page/form in this folder stay the same.
