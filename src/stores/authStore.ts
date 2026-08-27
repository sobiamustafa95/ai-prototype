import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from 'src/types';
import { authService } from 'src/services/authService';
import { CONFIG } from 'src/constants/config';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: 'idle' | 'authenticating' | 'authenticated' | 'error';
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  /** Internal — used by src/services/api-client.ts to persist a token it wrote. */
  setToken: (token: string | null) => void;
  /** Completes a session from a non-login flow (e.g. OTP verification finishing signup). */
  setSession: (user: AuthUser, token: string) => void;
}

/**
 * Auth client-state slice. One store per domain slice — never a single global store.
 * `token` is the single source of truth for the bearer token (api-client.ts reads
 * it via `useAuthStore.getState().token` rather than touching localStorage itself);
 * `persist` is what survives a reload, matching the pattern our real projects
 * converge on (CarnectionIQ, Glassatecture, Solar-lead all persist auth through
 * their state store rather than a bare localStorage key).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      status: 'idle',
      error: null,
      async login(credentials) {
        set({ status: 'authenticating', error: null });
        try {
          const { user, token } = await authService.login(credentials);
          set({ user, token, status: 'authenticated' });
        } catch (error) {
          set({
            status: 'error',
            error: error instanceof Error ? error.message : 'Login failed',
          });
        }
      },
      async logout() {
        await authService.logout();
        set({ user: null, token: null, status: 'idle' });
      },
      setToken(token) {
        set({ token });
      },
      setSession(user, token) {
        set({ user, token, status: 'authenticated', error: null });
      },
    }),
    {
      name: CONFIG.AUTH_STORE_NAME,
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
