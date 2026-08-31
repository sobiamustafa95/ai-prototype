import { test, expect } from './fixtures';

/**
 * Deterministic browser smoke-gate (Chromium only — see playwright.config.ts
 * and AGENTS.md § Testing). Proves: the app boots in a real browser, one
 * reference route renders, the MSW browser worker actually serves a real
 * fetch call, and one representative user interaction works end-to-end.
 * Not a full E2E suite — component/state behavior belongs in Vitest/RTL
 * workflow tests (src/components/**\/*.workflow.test.tsx).
 */
test.describe('App smoke', () => {
  test('boots and redirects a signed-out visitor from "/" to the login page', async ({
    page,
    checkA11y,
  }) => {
    // "/" is never real content (src/routes/HomeRedirectRoute.tsx) — a
    // signed-out visitor always lands on /login. Proves the app boots in a
    // real browser AND that the auth-aware root redirect actually fires.
    await page.goto('/');
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Sign in', level: 2 })).toBeVisible();

    await checkA11y();
  });

  test('loads Example data through the MSW-backed API and lets the user search it', async ({
    page,
    checkA11y,
  }) => {
    // /example needs no auth guard (AGENTS.md's public-shell routing
    // category), so it's reached directly rather than via "/", which now
    // always redirects a signed-out visitor to /login.
    await page.goto('/example');

    await expect(page.getByRole('heading', { name: 'Example', level: 1 })).toBeVisible();
    // Proves the real fetch → MSW → real HTTP response round trip, not a stub.
    // exact: true — Playwright's text matcher is substring-by-default, and
    // "Example item 1" is a substring of "Example item 10".
    await expect(page.getByText('Example item 1', { exact: true })).toBeVisible();
    await expect(page.getByText('Example item 10', { exact: true })).toBeVisible();

    await checkA11y();

    await page.getByRole('searchbox', { name: 'Search' }).fill('item 25');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText('Example item 25', { exact: true })).toBeVisible();
    await expect(page.getByText('Example item 1', { exact: true })).not.toBeVisible();
  });
});
