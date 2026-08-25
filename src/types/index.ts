/**
 * Shared, domain-agnostic TypeScript contracts.
 * Types (unlike components) MAY be barrel-exported from this file.
 */

/** Standard envelope every API returns. */
export interface ApiResponse<TData> {
  status: 'success' | 'error';
  data?: TData;
  error?: string;
}

/** Generic cursor/offset pagination metadata. */
export interface Paginated<TItem> {
  items: TItem[];
  page: number;
  pageSize: number;
  total: number;
}

/** Minimal authenticated principal used by the auth stub. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  /** Optional role for role-gated routes (see src/router/guards.tsx § RequireRole). */
  role?: string;
}

/** Auth token pair returned by the login stub. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
