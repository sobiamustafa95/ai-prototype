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
  test('boots and renders the home page', async ({ page, checkA11y }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Geeks FE Boilerplate' })).toBeVisible();
    // Both the primary nav and the page's own CTA link to /example with the
    // same accessible name — scope to the main content region to pick one.
    await expect(page.getByRole('main').getByRole('link', { name: 'Example' })).toBeVisible();

    await checkA11y();
  });

  test('loads Example data through the MSW-backed API and lets the user search it', async ({
    page,
    checkA11y,
  }) => {
    await page.goto('/');
    await page.getByRole('main').getByRole('link', { name: 'Example' }).click();

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
