import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { createQueryClient } from 'src/services/queryClient';

/**
 * Test-only render: a fresh `QueryClient` per call (never the app's shared
 * singleton in `src/services/queryClient.ts` — reusing it would leak cached
 * queries and toasts between tests) plus a `MemoryRouter`, since several
 * components read router context (`useNavigate`, `NavLink`, ...) even when a
 * given test isn't exercising navigation itself.
 */
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const queryClient = createQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
