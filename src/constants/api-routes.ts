/**
 * Centralized API route definitions. No concrete business entity may live here —
 * `AUTH` is a generic stub demonstrating the pattern, and `EXAMPLE` backs the one
 * example feature. Real projects add their own route groups following this shape.
 */
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    SIGNUP: '/api/v1/auth/signup',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    VERIFY_OTP: '/api/v1/auth/verify-otp',
    RESEND_OTP: '/api/v1/auth/resend-otp',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
  },
  // Backs src/components/features/ExampleWidget — copy & rename per feature.
  EXAMPLE: {
    LIST: '/api/v1/example-items',
  },
} as const;
