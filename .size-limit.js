/**
 * Blocking, measurable bundle-size budget — separate from Vite's own
 * `chunkSizeWarningLimit` (vite.config.ts), which stays an advisory
 * (non-blocking) warning. This is the enforced gate: `pnpm check:build-budget`,
 * wired into `pnpm verify` right after `check:build` (see AGENTS.md § Quality
 * Gate and § Performance Budget for the full numbers/rationale).
 *
 * `@size-limit/file` only reads already-built files — no webpack/esbuild
 * re-bundle — so it works directly against Vite's real `dist/assets/` output.
 * `gzip: true` on both checks: matches the compressed size Vite's own build
 * log already reports, and gzip (not raw) is what actually crosses the wire.
 *
 * Both `path` globs are pattern-based, not a per-file list: every current
 * route chunk (LoginPage, DashboardPage, ExamplePage, ...) is already covered
 * without being named here, and any future route/feature chunk added under
 * `src/routes/PublicRoutes.tsx` / `ProtectedRoutes.tsx` is automatically
 * picked up by the same glob on its next build — no config edit required.
 */
export default [
  {
    name: 'Entry bundle (dist/assets/index-*.js)',
    path: 'dist/assets/index-*.js',
    gzip: true,
    // Baseline 160.95 kB gzip + ~20% buffer, rounded up. Every visitor
    // downloads this chunk on first load (React/React-DOM/React Router/
    // TanStack Query/Zustand/Zod/Axios + app shell) — the single number with
    // the most direct effect on real users, so it gets its own budget instead
    // of being averaged into the total below.
    limit: '195 kB'
  },
  {
    name: 'Total JS (dist/assets/*.js)',
    path: 'dist/assets/*.js',
    gzip: true,
    // Baseline ~223 kB gzip (entry + every lazy route/vendor chunk combined)
    // + ~20% buffer, rounded up. Catches aggregate growth the entry-only
    // check above can't see on its own — e.g. a new route eagerly importing
    // a heavy dependency instead of lazy-loading it, or an existing lazy
    // chunk quietly ballooning.
    limit: '268 kB'
  }
];
