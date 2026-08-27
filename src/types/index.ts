/**
 * Shared, domain-agnostic TypeScript contracts.
 * Types (unlike components) MAY be barrel-exported from this file.
 */

/** Success envelope every `/auth/*` (and other module) response wraps its payload in. */
export interface ApiResponse<TData> {
  data: TData;
  status: number;
  message: string;
}

/** Generic cursor/offset pagination metadata. */
export interface Paginated<TItem> {
  items: TItem[];
  page: number;
  pageSize: number;
  total: number;
}

/** Authenticated principal, matching the backend's `/auth` user shape. */
export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  /** Role for role-gated routes (see src/routes/RoleGuards.tsx). */
  role: string;
  status: string;
  avatar?: string;
}

/**
 * Access + refresh token pair. The access token is a short-lived (15m) JWT sent
 * as `Authorization: Bearer`; the refresh token is a 60-day opaque credential
 * sent only to `/auth/refresh-token` and rotated on every use (see
 * src/services/api-client.ts for the rotation/retry logic).
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  refreshExpiresIn: string;
}
