/**
 * Centralized API route definitions. No concrete business entity may live here —
 * `AUTH` mirrors the real `/auth` backend contract, and `EXAMPLE` backs the one
 * example feature. Real projects add their own route groups following this shape.
 */
export const API_ROUTES = {
  AUTH: {
    SIGNUP: '/auth/signup',
    VERIFY_SIGNUP_OTP: '/auth/verify-signup-otp',
    RESEND_SIGNUP_OTP: '/auth/resend-signup-otp',
    LOGIN: '/auth/login',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_FORGOT_PASSWORD_OTP: '/auth/verify-forgot-password-otp',
    FORGOT_PASSWORD_LINK: '/auth/forgot-password-link',
    VERIFY_RESET_PASSWORD: '/auth/verify-reset-password',
    APPLE_CALLBACK: '/auth/apple/callback',
    ME: '/auth/get-authenticated-user',
    CHANGE_PASSWORD: '/auth/change-password',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL_DEVICES: '/auth/logout-all-devices',
    ACTIVE_SESSIONS: '/auth/active-sessions',
  },
  // Backs src/components/example/ExampleWidget — copy & rename per feature.
  EXAMPLE: {
    LIST: '/api/v1/example-items',
  },
} as const;
