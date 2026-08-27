import { fileURLToPath, URL } from 'node:url';
// `defineConfig` from 'vitest/config' is a drop-in replacement for Vite's own —
// same Vite config, plus it type-checks the `test` block below. One config
// file for both dev/build and tests, so plugins/aliases never drift apart.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Fail loudly if a lazy chunk balloons; heavy features must be code-split (>50KB).
    chunkSizeWarningLimit: 500,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    css: false,
  },
});
