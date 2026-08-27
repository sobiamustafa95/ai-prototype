import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthTokens, AuthUser } from 'src/types';
import { authService } from 'src/services/authService';
import { queryClient } from 'src/services/queryClient';
import { CONFIG } from 'src/constants/config';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: 'idle' | 'authenticating' | 'authenticated' | 'error';
  error: string | null;
  /** False until zustand/persist has finished reading localStorage (see guards.tsx). */
  hasHydrated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  /** Internal — used by src/services/api-client.ts to persist a rotated token pair. */
  setTokens: (tokens: AuthTokens) => void;
  /** Completes a session from a non-login flow (e.g. OTP verification finishing signup). */
  setSession: (user: AuthUser, tokens: AuthTokens) => void;
  /** Internal — called by `onRehydrateStorage` once persisted state has been read back. */
  setHasHydrated: (value: boolean) => void;
}

function clearSession(): void {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    status: 'idle',
  });
  // authStore -> queryClient -> api-client -> authStore is a safe cycle here: every
  // read/call happens inside a callback (never at module-eval time), matching the
  // same pattern api-client.ts documents for its own authStore import.
  queryClient.clear();
}

/**
 * Auth client-state slice. One store per domain slice — never a single global store.
 * `accessToken`/`refreshToken` are the single source of truth for the session
 * (api-client.ts reads/writes them via `useAuthStore.getState()`/`setTokens`
 * rather than touching localStorage itself); `persist` is what survives a reload.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      status: 'idle',
      error: null,
      hasHydrated: false,
      async login(credentials) {
        set({ status: 'authenticating', error: null });
        try {
          const { user, tokens } = await authService.login(credentials);
          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            status: 'authenticated',
          });
        } catch (error) {
          set({
            status: 'error',
            error: error instanceof Error ? error.message : 'Login failed',
          });
        }
      },
      async logout() {
        await authService.logout().catch(() => {});
        clearSession();
      },
      async logoutAllDevices() {
        await authService.logoutAllDevices().catch(() => {});
        clearSession();
      },
      setTokens(tokens) {
        set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      },
      setSession(user, tokens) {
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          status: 'authenticated',
          error: null,
        });
      },
      setHasHydrated(value) {
        set({ hasHydrated: value });
      },
    }),
    {
      name: CONFIG.AUTH_STORE_NAME,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      // Calls the method on the rehydrated `state` object itself rather than the
      // `useAuthStore` module binding — for a synchronous storage (localStorage),
      // this callback can fire before `export const useAuthStore = ...` finishes
      // assigning, and referencing that binding here would throw (TDZ).
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
