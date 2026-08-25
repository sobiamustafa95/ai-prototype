import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { CONFIG } from 'src/constants/config';
import { useAuthStore } from 'src/stores/authStore';

/** Normalized error the whole app can rely on (a real Error subclass). */
export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ---- Request interceptor: attach bearer token ----
// Reads from the auth store directly (not React state) — the standard pattern
// for an axios instance living outside the component tree (matches how our real
// projects structure this: CarnectionIQ and Solar-lead both call
// `useAuthStore.getState()` straight from their axios instance file). The
// api-client -> authStore -> authService -> api-client import cycle is safe here
// because every read happens inside a callback, never at module-eval time.
apiClient.interceptors.request.use((request: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }
  return request;
});

// ---- Response interceptor: error normalization + hard-logout on 401 ----
// Deliberately simple: our real projects that hit this in production (Carnection,
// Glow-Tech, Solar-lead) all just clear the session and redirect on 401 rather than
// silently refreshing — a silent single-flight refresh is real but rare (only one
// of four projects implements it well); see docs/auth-token-refresh.md for that
// pattern documented as an opt-in reference, not the default here.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.setState({ user: null, token: null, status: 'idle' });
    }

    const responseError = (error.response?.data as { error?: string } | undefined)?.error;
    const normalized = new ApiError(
      responseError ?? error.message ?? 'Network error',
      error.response?.status ?? 0,
      error.response?.data
    );
    return Promise.reject(normalized);
  }
);
